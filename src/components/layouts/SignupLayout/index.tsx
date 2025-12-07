'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../../utils/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function SignupLayout() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        // If already signed in, redirect to pricing
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                router.push('/pricing');
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleGoogleSignup = async () => {
        setLoading(true);
        setError('');

        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            // Redirect happens in useEffect above
        } catch (err: any) {
            console.error('Signup error:', err);
            setError(err.message || 'Failed to sign up. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '48px',
                maxWidth: '440px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#1a202c',
                        marginBottom: '8px'
                    }}>
                        Create Your Account
                    </h1>
                    <p style={{
                        fontSize: '16px',
                        color: '#718096'
                    }}>
                        Get started with professional security scanning
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: '#fed7d7',
                        color: '#c53030',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '24px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGoogleSignup}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: 'white',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        transition: 'all 0.2s',
                        opacity: loading ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                        if (!loading) {
                            e.currentTarget.style.borderColor = '#cbd5e0';
                            e.currentTarget.style.background = '#f7fafc';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.background = 'white';
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20">
                        <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
                        <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
                        <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
                        <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
                    </svg>
                    {loading ? 'Creating account...' : 'Sign up with Google'}
                </button>

                <div style={{
                    marginTop: '24px',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#718096'
                }}>
                    Already have an account?{' '}
                    <a
                        href="/login"
                        style={{
                            color: '#667eea',
                            fontWeight: '600',
                            textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                        Sign in
                    </a>
                </div>

                <div style={{
                    marginTop: '32px',
                    padding: '16px',
                    background: '#f7fafc',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#4a5568'
                }}>
                    <strong>What's next?</strong>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                        <li>Create your free account</li>
                        <li>Choose a plan that fits your needs</li>
                        <li>Start scanning immediately</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
