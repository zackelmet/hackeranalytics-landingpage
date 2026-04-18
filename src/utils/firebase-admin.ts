// Firebase Admin SDK — initialised lazily when credentials are present.
// When the required environment variables are absent (e.g. during static
// builds or local dev without a service account) the exports fall back to
// lightweight throwing proxies so unrelated code paths still compile.

import * as adminNS from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

let _app: App | null = null;

function getApp(): App {
    if (_app) return _app;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            'Firebase Admin credentials are not configured. ' +
            'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
        );
    }

    if (adminNS.apps.length > 0) {
        _app = adminNS.apps[0]!;
        return _app;
    }

    _app = adminNS.initializeApp({
        credential: adminNS.credential.cert({ projectId, clientEmail, privateKey })
    });

    return _app;
}

// Lazily-resolved Firestore instance — throws if credentials are missing.
export function getFirestore(): Firestore {
    return adminNS.firestore(getApp());
}

// Lazily-resolved Auth instance — throws if credentials are missing.
export function getAuth(): Auth {
    return adminNS.auth(getApp());
}

function throwingProxy(name: string) {
    return new Proxy({} as any, {
        get() {
            return () => {
                throw new Error(
                    `${name} is disabled — Firebase Admin credentials are not configured. ` +
                    'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
                );
            };
        }
    });
}

// Legacy default exports kept for backward-compatibility with existing imports.
export const auth = throwingProxy('Firebase Admin Auth');
export const db = throwingProxy('Firebase Admin Firestore');
