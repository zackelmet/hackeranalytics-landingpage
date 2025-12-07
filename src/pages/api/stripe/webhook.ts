import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { Readable } from 'stream';
import { db } from '../../../utils/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover'
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Disable body parsing, need raw body for signature verification
export const config = {
    api: {
        bodyParser: false,
    },
};

async function buffer(readable: Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

// Map Stripe price IDs to plan tiers
const PRICE_TO_TIER: Record<string, 'essential' | 'pro' | 'scale'> = {
    'price_1QYmkx053rHBeqKv16OHVhQw': 'essential', // $96/year
    'price_1QYmmZ053rHBeqKvSPLtl5Yn': 'pro',       // $240/year
    'price_1QYmn9053rHBeqKv4zzTZhBo': 'scale'      // $720/year
};

// Define scan limits per tier
const TIER_LIMITS = {
    essential: {
        openvas: 100,
        nmap: 0,
        malwareAnalysis: 0,
        dnsRecon: 0
    },
    pro: {
        openvas: 500,
        nmap: 500,
        malwareAnalysis: 0,
        dnsRecon: 0
    },
    scale: {
        openvas: 999999, // "Unlimited"
        nmap: 999999,
        malwareAnalysis: 999999,
        dnsRecon: 999999
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const buf = await buffer(req as unknown as Readable);
    const sig = req.headers['stripe-signature'];

    if (!sig) {
        return res.status(400).json({ error: 'No signature' });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
        console.error('⚠️ Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    console.log('✅ Webhook event received:', event.type);

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                // Get customer details
                const customerId = session.customer as string;
                const subscriptionId = session.subscription as string;

                // Get user ID from metadata (set during checkout)
                const userId = session.metadata?.userId;

                if (!userId) {
                    console.error('❌ No userId in session metadata');
                    return res.status(400).json({ error: 'No userId in metadata' });
                }

                // Get subscription to find price ID
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const priceId = subscription.items.data[0]?.price.id;
                const planTier = PRICE_TO_TIER[priceId] || 'essential';

                // Create or update user document in Firestore
                const userRef = db.collection('users').doc(userId);
                const limits = TIER_LIMITS[planTier];

                await userRef.set({
                    uid: userId,
                    email: session.customer_details?.email,
                    stripeCustomerId: customerId,
                    subscriptionId: subscriptionId,
                    planTier: planTier,
                    subscriptionStatus: 'active',
                    cycleStart: new Date(),
                    lastResetAt: new Date(),
                    usage: {
                        openvas: { used: 0, limit: limits.openvas },
                        nmap: { used: 0, limit: limits.nmap },
                        malwareAnalysis: { used: 0, limit: limits.malwareAnalysis },
                        dnsRecon: { used: 0, limit: limits.dnsRecon }
                    },
                    updatedAt: new Date()
                }, { merge: true });

                console.log(`✅ User ${userId} subscribed to ${planTier} plan`);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Find user by Stripe customer ID
                const usersSnapshot = await db.collection('users')
                    .where('stripeCustomerId', '==', customerId)
                    .limit(1)
                    .get();

                if (usersSnapshot.empty) {
                    console.error(`❌ No user found for customer ${customerId}`);
                    return res.status(404).json({ error: 'User not found' });
                }

                const userDoc = usersSnapshot.docs[0];
                const priceId = subscription.items.data[0]?.price.id;
                const planTier = PRICE_TO_TIER[priceId] || 'essential';
                const limits = TIER_LIMITS[planTier];

                // Update subscription status and tier
                await userDoc.ref.update({
                    subscriptionId: subscription.id,
                    planTier: planTier,
                    subscriptionStatus: subscription.status,
                    'usage.openvas.limit': limits.openvas,
                    'usage.nmap.limit': limits.nmap,
                    'usage.malwareAnalysis.limit': limits.malwareAnalysis,
                    'usage.dnsRecon.limit': limits.dnsRecon,
                    updatedAt: new Date()
                });

                console.log(`✅ Subscription updated for user ${userDoc.id}: ${subscription.status}`);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Find user by Stripe customer ID
                const usersSnapshot = await db.collection('users')
                    .where('stripeCustomerId', '==', customerId)
                    .limit(1)
                    .get();

                if (usersSnapshot.empty) {
                    console.error(`❌ No user found for customer ${customerId}`);
                    return res.status(404).json({ error: 'User not found' });
                }

                const userDoc = usersSnapshot.docs[0];

                // Mark subscription as canceled, keep usage history
                await userDoc.ref.update({
                    subscriptionStatus: 'canceled',
                    updatedAt: new Date()
                });

                console.log(`✅ Subscription canceled for user ${userDoc.id}`);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                // Find user by Stripe customer ID
                const usersSnapshot = await db.collection('users')
                    .where('stripeCustomerId', '==', customerId)
                    .limit(1)
                    .get();

                if (usersSnapshot.empty) {
                    console.log(`⚠️ No user found for customer ${customerId} (might be first payment)`);
                    break;
                }

                const userDoc = usersSnapshot.docs[0];
                const userData = userDoc.data();

                // Reset usage on successful payment (new billing cycle)
                await userDoc.ref.update({
                    subscriptionStatus: 'active',
                    cycleStart: new Date(),
                    lastResetAt: new Date(),
                    'usage.openvas.used': 0,
                    'usage.nmap.used': 0,
                    'usage.malwareAnalysis.used': 0,
                    'usage.dnsRecon.used': 0,
                    updatedAt: new Date()
                });

                console.log(`✅ Usage reset for user ${userDoc.id} on billing cycle renewal`);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                // Find user by Stripe customer ID
                const usersSnapshot = await db.collection('users')
                    .where('stripeCustomerId', '==', customerId)
                    .limit(1)
                    .get();

                if (usersSnapshot.empty) {
                    console.error(`❌ No user found for customer ${customerId}`);
                    return res.status(404).json({ error: 'User not found' });
                }

                const userDoc = usersSnapshot.docs[0];

                // Mark subscription as past_due
                await userDoc.ref.update({
                    subscriptionStatus: 'past_due',
                    updatedAt: new Date()
                });

                console.log(`⚠️ Payment failed for user ${userDoc.id}`);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('❌ Error processing webhook:', error);
        return res.status(500).json({ error: error.message });
    }
}
