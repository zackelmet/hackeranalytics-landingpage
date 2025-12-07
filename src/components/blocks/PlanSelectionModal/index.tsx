import * as React from 'react';
import { useState } from 'react';

interface PlanSelectionModalProps {
    onClose: () => void;
}

export default function PlanSelectionModal({ onClose }: PlanSelectionModalProps) {
    const [loading, setLoading] = useState<string | null>(null);

    // Price IDs from environment
    const priceIds = {
        essential: process.env.NEXT_PUBLIC_STRIPE_PRICE_ESSENTIAL,
        pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
        scale: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCALE
    };

    // Log environment variables for debugging (only in development)
    React.useEffect(() => {
        console.log('Stripe Price IDs:', {
            essential: priceIds.essential ? '✓ Set' : '✗ Missing',
            pro: priceIds.pro ? '✓ Set' : '✗ Missing',
            scale: priceIds.scale ? '✓ Set' : '✗ Missing'
        });
    }, []);

    const handleCheckout = (tier: string, priceId: string | undefined) => {
        setLoading(tier);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.example.app';
        // Forward to external app pricing page — the app will handle auth and checkout flow.
        window.location.href = `${appUrl}/pricing`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 p-8 max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Please Pick a Plan to Get Started</h2>
                    <p className="text-gray-600">Choose the plan that best fits your needs</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {/* Essential Plan */}
                    <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
                        <div className="text-center mb-4">
                            <h3 className="text-xl font-bold mb-2">Essential</h3>
                            <div className="text-3xl font-bold mb-1">$96</div>
                            <div className="text-sm text-gray-600">per year</div>
                        </div>
                        <ul className="space-y-2 mb-6 text-sm">
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>50 OpenVAS scans/month</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>30 Nmap scans/month</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Basic security reports</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Email support</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handleCheckout('essential', priceIds.essential)}
                            disabled={loading !== null}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading === 'essential' ? 'Loading...' : 'Select Essential'}
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="border-2 border-blue-500 rounded-lg p-6 relative shadow-lg">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                POPULAR
                            </span>
                        </div>
                        <div className="text-center mb-4">
                            <h3 className="text-xl font-bold mb-2">Pro</h3>
                            <div className="text-3xl font-bold mb-1">$240</div>
                            <div className="text-sm text-gray-600">per year</div>
                        </div>
                        <ul className="space-y-2 mb-6 text-sm">
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>200 OpenVAS scans/month</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>150 Nmap scans/month</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Advanced security reports</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Priority support</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>API access</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handleCheckout('pro', priceIds.pro)}
                            disabled={loading !== null}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading === 'pro' ? 'Loading...' : 'Select Pro'}
                        </button>
                    </div>

                    {/* Scale Plan */}
                    <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
                        <div className="text-center mb-4">
                            <h3 className="text-xl font-bold mb-2">Scale</h3>
                            <div className="text-3xl font-bold mb-1">$720</div>
                            <div className="text-sm text-gray-600">per year</div>
                        </div>
                        <ul className="space-y-2 mb-6 text-sm">
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Unlimited OpenVAS scans</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Unlimited Nmap scans</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Custom security reports</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>24/7 dedicated support</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Full API access</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Custom integrations</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handleCheckout('scale', priceIds.scale)}
                            disabled={loading !== null}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading === 'scale' ? 'Loading...' : 'Select Scale'}
                        </button>
                    </div>
                </div>

                <div className="text-center text-sm text-gray-600">
                    <p>Need help choosing? Contact us at <a href="mailto:support@example.com" className="text-blue-600 hover:underline">support@example.com</a></p>
                </div>
            </div>
        </div>
    );
}
