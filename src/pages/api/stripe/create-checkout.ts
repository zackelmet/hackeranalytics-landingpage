import { NextApiRequest, NextApiResponse } from 'next';

// Checkout API disabled in this repo. Checkout and subscriptions are handled
// by the external app. This endpoint returns 404 to indicate it is intentionally disabled.

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
    res.status(404).json({
        error: 'Checkout is disabled in this repository. Use the hosted app for billing and subscriptions.',
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com'
    });
}
