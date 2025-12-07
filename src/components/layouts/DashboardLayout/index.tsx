import * as React from 'react';
import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { auth, db } from '../../../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
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

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showPlanModal, setShowPlanModal] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push('/login?redirect=/dashboard');
                return;
            }

            setUser(currentUser);
            
            // Log the user's UID for debugging
            console.log('Current user UID:', currentUser.uid);
            console.log('Current user email:', currentUser.email);
            
            // Get fresh ID token to ensure auth is ready
            try {
                const token = await currentUser.getIdToken(true);
                console.log('Auth token obtained, length:', token.length);
            } catch (tokenErr) {
                console.error('Error getting auth token:', tokenErr);
            }

            try {
                // Fetch user data from Firestore
                const userDocRef = doc(db, 'users', currentUser.uid);
                console.log('Attempting to fetch document:', `users/${currentUser.uid}`);
                const userDoc = await getDoc(userDocRef);
                console.log('Document fetch completed. Exists?', userDoc.exists());

                if (userDoc.exists()) {
                    const data = userDoc.data() as UserData;
                    console.log('User document data:', JSON.stringify(data, null, 2));
                    setUserData(data);
                } else {
                    // User document doesn't exist yet (new user, no subscription)
                    console.log('No user document found, creating free tier user');
                    const defaultData: UserData = {
                        uid: currentUser.uid,
                        email: currentUser.email || '',
                        subscriptionStatus: 'inactive',
                        planTier: 'free',
                        usage: {
                            OpenVAS: { used: 0, limit: 0 },
                            nmap: { used: 0, limit: 0 }
                        },
                        cycleStart: new Date(),
                        lastResetAt: new Date()
                    };
                    
                    // Try to create the document
                    try {
                        await setDoc(userDocRef, defaultData);
                        console.log('Created free tier user document successfully');
                        setUserData(defaultData);
                    } catch (createErr) {
                        console.error('Error creating user document:', createErr);
                        setUserData({
                            uid: currentUser.uid,
                            email: currentUser.email || '',
                            subscriptionStatus: 'inactive'
                        });
                    }
                }
                
                // Check if user needs to see plan modal
                const data = userDoc.exists() ? userDoc.data() as UserData : null;
                if (data && data.subscriptionStatus === 'inactive') {
                    setShowPlanModal(true);
                }
            } catch (err: any) {
                console.error('Error fetching user data:', err);
                console.error('Error code:', err.code);
                console.error('Error message:', err.message);
                
                // Check if it's a permission error
                if (err.code === 'permission-denied') {
                    setError('Access denied. Please ensure you are logged in with the correct account.');
                } else {
                    setError('Failed to load subscription data: ' + (err.message || 'Unknown error'));
                }
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    const isActive = userData?.subscriptionStatus === 'active' || userData?.subscriptionStatus === 'trialing';
    
    // Calculate total usage across all scanners
    const getTotalUsage = () => {
        if (!userData?.usage) return { used: 0, limit: 0 };
        const scanners = Object.values(userData.usage);
        return scanners.reduce(
            (acc, scanner) => ({
                used: acc.used + scanner.used,
                limit: acc.limit + scanner.limit
            }),
            { used: 0, limit: 0 }
        );
    };
    
    const totalUsage = getTotalUsage();
    const usagePercent = totalUsage.limit 
        ? Math.min((totalUsage.used / totalUsage.limit) * 100, 100)
        : 0;

    const getTierBadgeColor = (tier?: string) => {
        switch (tier) {
            case 'premium': return 'bg-gradient-to-r from-purple-500 to-pink-500';
            case 'pro': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
            case 'basic': return 'bg-gradient-to-r from-green-500 to-emerald-500';
            default: return 'bg-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={classNames('sb-page', pageMeta.pageCssClasses)} {...(enableAnnotations && { 'data-sb-object-id': pageMeta.id })}>
            <div className="sb-base sb-default-base-layout">
                {site.header && <Header {...site.header} enableAnnotations={enableAnnotations} />}
                
                <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
                            <p className="text-gray-400">Welcome back, {user?.email}</p>
                        </div>

                        {error && (
                            <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        {/* Subscription Status Card */}
                        <div className={classNames(
                            'bg-slate-800 rounded-xl border p-6 mb-6 transition-all',
                            isActive ? 'border-cyan-500/30' : 'border-gray-700'
                        )}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-white">Subscription Status</h2>
                                {userData?.planTier ? (
                                    <span className={classNames(
                                        'px-4 py-2 rounded-full text-white font-semibold text-sm uppercase',
                                        getTierBadgeColor(userData.planTier)
                                    )}>
                                        {userData.planTier}
                                    </span>
                                ) : (
                                    <span className="px-4 py-2 rounded-full bg-gray-600 text-white font-semibold text-sm uppercase">
                                        No Plan
                                    </span>
                                )}
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm mb-1">Status</p>
                                    <p className={classNames(
                                        'text-lg font-semibold capitalize',
                                        isActive ? 'text-green-400' : 'text-red-400'
                                    )}>
                                        {userData?.subscriptionStatus || 'Inactive'}
                                    </p>
                                </div>

                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm mb-1">Total Scans</p>
                                    <p className="text-lg font-semibold text-white">
                                        {totalUsage.used} / {totalUsage.limit}
                                    </p>
                                </div>

                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm mb-1">Cycle Resets</p>
                                    <p className="text-lg font-semibold text-white">
                                        {userData?.cycleStart 
                                            ? new Date(userData.cycleStart.toDate()).toLocaleDateString()
                                            : 'N/A'
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Usage Bar */}
                            {totalUsage.limit > 0 && (
                                <div className="mt-6">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Total Scan Usage</span>
                                        <span className="text-gray-400">{usagePercent.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className={classNames(
                                                'h-full transition-all duration-300 rounded-full',
                                                usagePercent >= 90 ? 'bg-red-500' : 
                                                usagePercent >= 70 ? 'bg-yellow-500' : 
                                                'bg-gradient-to-r from-cyan-500 to-blue-500'
                                            )}
                                            style={{ width: `${usagePercent}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {/* Per-Scanner Usage Breakdown */}
                            {userData?.usage && Object.keys(userData.usage).length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-white mb-3">Scanner Usage</h3>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {Object.entries(userData.usage).map(([scannerType, usage]) => {
                                            const percent = usage.limit > 0 
                                                ? Math.min((usage.used / usage.limit) * 100, 100)
                                                : 0;
                                            return (
                                                <div key={scannerType} className="bg-slate-900/50 rounded-lg p-3">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-gray-300 capitalize font-medium">
                                                            {scannerType.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                        <span className="text-gray-400 text-sm">
                                                            {usage.used}/{usage.limit}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Main Content Area */}
                        <div className={classNames(
                            'bg-slate-800 rounded-xl border p-6 transition-all relative',
                            isActive ? 'border-gray-700' : 'border-gray-700'
                        )}>
                            <h2 className="text-2xl font-bold text-white mb-4">Scanner Tools</h2>
                            
                            {!isActive && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 rounded-xl z-10">
                                    <div className="text-center p-8">
                                        <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <h3 className="text-xl font-bold text-white mb-2">Subscription Required</h3>
                                        <p className="text-gray-400 mb-4">Subscribe to unlock scanner tools and start scanning</p>
                                        <a 
                                            href="/pricing" 
                                            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
                                        >
                                            View Pricing Plans
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="bg-slate-900/50 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-white mb-2">Quick Scan</h3>
                                    <p className="text-gray-400 mb-4">Perform a vulnerability scan on a target IP or URL</p>
                                    <input 
                                        type="text" 
                                        placeholder="Enter IP or URL"
                                        className="w-full bg-slate-800 border border-gray-600 rounded-lg px-4 py-2 text-white mb-3"
                                        disabled={!isActive}
                                    />
                                    <button 
                                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
                                        disabled={!isActive}
                                    >
                                        Start Scan
                                    </button>
                                </div>

                                <div className="bg-slate-900/50 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-white mb-2">Scan History</h3>
                                    <p className="text-gray-400">Your recent scans will appear here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {site.footer && <Footer {...site.footer} enableAnnotations={enableAnnotations} />}
            </div>
            
            {/* Plan Selection Modal for Inactive Users */}
            {showPlanModal && userData?.subscriptionStatus === 'inactive' && (
                <PlanSelectionModal onClose={() => setShowPlanModal(false)} />
            )}
        </div>
    );
}
