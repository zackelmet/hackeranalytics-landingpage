// Firebase Admin integration removed for the landing site.
// Export lightweight stubs so server-side code that imports this
// module during build won't cause module resolution failures.

function throwingProxy(name: string) {
    return new Proxy({}, {
        get() {
            return () => {
                throw new Error(`${name} is disabled in the landing site build. Use the external app for server-side account operations.`);
            };
        }
    });
}

export const auth = throwingProxy('Firebase Admin Auth');
export const db = throwingProxy('Firebase Admin Firestore');
