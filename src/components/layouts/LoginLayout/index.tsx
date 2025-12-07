import * as React from 'react';
import { getBaseLayoutComponent } from '../../../utils/base-layout';
import dynamic from 'next/dynamic';

const GoogleSignInButton = dynamic(() => import('../../auth/GoogleSignInButton'), { ssr: false });

export default function LoginPage(props) {
    const { page, site } = props;
    const BaseLayout = getBaseLayoutComponent(page.baseLayout, site.baseLayout);

    return (
        <BaseLayout page={page} site={site}>
            <main id="main" className="sb-layout">
                <div className="bg-neutral-fg-dark py-20">
                    <div className="max-w-md mx-auto px-4">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold mb-4">Sign In</h1>
                            <p className="text-xl text-neutral-300">Access your vulnerability scanning dashboard</p>
                        </div>
                        
                        <div className="bg-dark-fg-light p-8 rounded-lg border border-neutral-700">
                            <GoogleSignInButton />
                            
                            <div className="mt-6 text-center text-sm">
                                <p className="text-neutral-400">
                                    Don't have an account?{' '}
                                    <a href="/signup" className="text-primary-500 hover:underline font-semibold">
                                        Sign up
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </BaseLayout>
    );
}
