import * as admin from 'firebase-admin';

// Initialise the Firebase Admin SDK once per process (Next.js dev server and
// serverless functions may call this module multiple times).
function getApp(): admin.app.App {
    if (admin.apps.length > 0) {
        return admin.apps[0] as admin.app.App;
    }

    // Accept credentials either as an inline JSON string stored in
    // FIREBASE_SERVICE_ACCOUNT_JSON, or via the standard ADC / GOOGLE_APPLICATION_CREDENTIALS path.
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const credential = serviceAccountJson
        ? admin.credential.cert(JSON.parse(serviceAccountJson) as admin.ServiceAccount)
        : admin.credential.applicationDefault();

    return admin.initializeApp({
        credential,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
}

export const auth = getApp().auth();
export const db = getApp().firestore();
