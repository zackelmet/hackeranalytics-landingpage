import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { auth } from '../../../utils/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check required environment variables
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('STRIPE_SECRET_KEY is not set');
            return res.status(500).json({ error: 'Server configuration error: Missing Stripe key' });
        }

        if (!process.env.NEXT_PUBLIC_BASE_URL) {
            console.error('NEXT_PUBLIC_BASE_URL is not set');
            return res.status(500).json({ error: 'Server configuration error: Missing base URL' });
        }

        const { priceId, idToken } = req.body;

        if (!priceId || !idToken) {
            console.error('Missing required fields:', { priceId: !!priceId, idToken: !!idToken });
            return res.status(400).json({ error: 'Missing priceId or idToken' });
        }

        // Verify Firebase ID token
        console.log('Verifying Firebase ID token...');
        const decodedToken = await auth.verifyIdToken(idToken);
        const userId = decodedToken.uid;
        const userEmail = decodedToken.email;
        console.log('Token verified for user:', userId);

        // Create Stripe checkout session
        console.log('Creating Stripe checkout session with priceId:', priceId);
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
            customer_email: userEmail,
            client_reference_id: userId,
            metadata: {
                userId: userId, // Used by webhook to identify user
                firebaseUserId: userId,
            },
        });

        console.log('Checkout session created successfully:', session.id);
        return res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        console.error('Error details:', {
            message: error.message,
            type: error.type,
            code: error.code,
            statusCode: error.statusCode,
            stack: error.stack
        });
        return res.status(500).json({ 
            error: error.message || 'Failed to create checkout session',
            type: error.type,
            code: error.code,
            details: error.toString(),
            stack: error.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack
        });
    }
}
