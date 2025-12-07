import { NextApiRequest, NextApiResponse } from 'next';

// Stripe webhook handling is disabled in this repository. The hosted app
// processes billing events. This endpoint returns 410 Gone to indicate
// it should no longer be used.

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
    res.status(410).json({
        error: 'Webhook processing has been disabled in this repository. Billing events are handled by the external app.',
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com'
    });
}
