import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Check which env vars are available (without exposing values)
        const envCheck = {
            STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
            STRIPE_SECRET_KEY_LENGTH: process.env.STRIPE_SECRET_KEY?.length || 0,
            NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL,
            NEXT_PUBLIC_BASE_URL_VALUE: process.env.NEXT_PUBLIC_BASE_URL || 'not set',
            FIREBASE_ADMIN_PROJECT_ID: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
            FIREBASE_ADMIN_CLIENT_EMAIL: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            FIREBASE_ADMIN_PRIVATE_KEY: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
            FIREBASE_ADMIN_PRIVATE_KEY_LENGTH: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length || 0,
            STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
            NEXT_PUBLIC_STRIPE_PRICE_ESSENTIAL: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ESSENTIAL,
            NEXT_PUBLIC_STRIPE_PRICE_PRO: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
            NEXT_PUBLIC_STRIPE_PRICE_SCALE: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_SCALE,
        };

        return res.status(200).json({
            success: true,
            environment: process.env.NODE_ENV,
            netlifyContext: process.env.CONTEXT || 'unknown',
            envVarsPresent: envCheck,
            allEnvVarsSet: Object.entries(envCheck).filter(([k, v]) => !k.includes('LENGTH') && !k.includes('VALUE')).every(([k, v]) => v === true),
        });
    } catch (error: any) {
        return res.status(200).json({
            success: false,
            error: error.message,
            stack: error.stack,
        });
    }
}
