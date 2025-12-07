'use client';

import { useState } from 'react';

interface CheckoutButtonProps {
    tier: 'ESSENTIAL' | 'PRO' | 'SCALE';
    label?: string;
    style?: string;
}

export default function CheckoutButton({ tier, label = 'Get Started', style = 'primary' }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);

    // Redirect users to the external app for purchases. Uses env var if set.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.example.app';

    const handleCheckout = () => {
        setLoading(true);
        // Redirect to the app's pricing/checkout page. The app handles auth and checkout.
        window.location.href = `${appUrl}/pricing`;
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className={`sb-component sb-component-block sb-component-button ${
                style === 'primary' ? 'sb-component-button-primary' : 'sb-component-button-secondary'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {loading ? 'Redirecting…' : label}
        </button>
    );
}
