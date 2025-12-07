import * as admin from 'firebase-admin';

function initializeFirebaseAdmin() {
    if (admin.apps.length) {
        return;
    }

    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    
    if (!privateKey) {
        throw new Error('FIREBASE_ADMIN_PRIVATE_KEY environment variable is not set');
    }
    
    if (!projectId) {
        throw new Error('FIREBASE_ADMIN_PROJECT_ID environment variable is not set');
    }
    
    if (!clientEmail) {
        throw new Error('FIREBASE_ADMIN_CLIENT_EMAIL environment variable is not set');
    }
    
    // Handle both escaped newlines and actual newlines
    const formattedKey = privateKey.includes('\\n') 
        ? privateKey.replace(/\\n/g, '\n')
        : privateKey;
    
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: projectId,
                clientEmail: clientEmail,
                privateKey: formattedKey,
            }),
        });
    } catch (error: any) {
        throw new Error(`Failed to initialize Firebase Admin: ${error.message}`);
    }
}

// Lazy initialization - only initialize when actually used
export const auth = new Proxy({} as admin.auth.Auth, {
    get(target, prop) {
        initializeFirebaseAdmin();
        return (admin.auth() as any)[prop];
    }
});

export const db = new Proxy({} as admin.firestore.Firestore, {
    get(target, prop) {
        initializeFirebaseAdmin();
        return (admin.firestore() as any)[prop];
    }
});
