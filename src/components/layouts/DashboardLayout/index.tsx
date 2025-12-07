import * as React from 'react';
import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
// Firebase removed for landing site: dashboard lives in the external app
import Header from '../../sections/Header';
import Footer from '../../sections/Footer';
import PlanSelectionModal from '../../blocks/PlanSelectionModal';

interface ScannerUsage {
    used: number;
    limit: number;
}

interface UserData {
    uid: string;
    email: string;
    stripeCustomerId?: string;
    subscriptionId?: string;
    planTier?: string;
    cycleStart?: any;
    lastResetAt?: any;
    subscriptionStatus?: string;
    usage?: {
        [scannerType: string]: ScannerUsage;
    };
}

export default function DashboardLayout(props) {
    const { page, site } = props;
    const { enableAnnotations = true } = site;
    const pageMeta = page?.__metadata || {};
    const router = useRouter();

    const [showPlanModal, setShowPlanModal] = useState(false);

    // For the marketing/landing site the actual dashboard lives in the external app.
    // This component no longer depends on Firebase or Firestore and simply
    // points users to the hosted app for auth and dashboard features.
    useEffect(() => {
        // no-op for now; keep to match prior behavior surface
        setShowPlanModal(false);
    }, []);

    const isActive = false;

    return (
        <div className={classNames('sb-page', pageMeta.pageCssClasses)} {...(enableAnnotations && { 'data-sb-object-id': pageMeta.id })}>
            <div className="sb-base sb-default-base-layout">
                {site.header && <Header {...site.header} enableAnnotations={enableAnnotations} />}
                
                <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
                            <p className="text-gray-400">The full dashboard and account management are available in the hosted app.</p>
                        </div>

                        <div className="bg-slate-800 rounded-xl border p-8">
                            <p className="text-gray-300 mb-6">To access your scans, subscriptions, and account settings please open the application.</p>
                            <a
                                href={process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com'}
                                className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
                            >
                                Open App
                            </a>
                            <p className="text-sm text-gray-500 mt-4">If you expected an in-site dashboard, it has been moved to the app to keep this site focused on marketing and documentation.</p>
                        </div>
                    </div>
                </main>

                {site.footer && <Footer {...site.footer} enableAnnotations={enableAnnotations} />}
            </div>
            
            {/* Plan Selection Modal kept for compatibility but not shown on landing site */}
            {showPlanModal && (
                <PlanSelectionModal onClose={() => setShowPlanModal(false)} />
            )}
        </div>
    );
}
