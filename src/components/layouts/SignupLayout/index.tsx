'use client';

import { useState } from 'react';

export default function SignupLayout() {
    const [loading, setLoading] = useState(false);

    const handleOpenAppSignup = () => {
        setLoading(true);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com';
        window.location.href = appUrl;
    };

    const appLogin = process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com';

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

                <button
                    onClick={handleOpenAppSignup}
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
                >
                    {loading ? 'Opening app...' : 'Open App'}
                </button>

                <div style={{
                    marginTop: '24px',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#718096'
                }}>
                    Already have an account?{' '}
                    <a
                        href={appLogin}
                        style={{
                            color: '#667eea',
                            fontWeight: '600',
                            textDecoration: 'none'
                        }}
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
                        <li>Start scanning in the app</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
