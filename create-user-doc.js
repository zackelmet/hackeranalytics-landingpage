const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin with environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

const db = admin.firestore();

async function createUserDocument() {
  const userId = 'As3uLVU79faJMacOGJpiOyhG2eu1';
  
  const userData = {
    uid: userId,
    email: 'zacharyelmetennani@gmail.com',
    subscriptionStatus: 'active',
    planTier: 'pro',
    cycleStart: admin.firestore.Timestamp.now(),
    lastResetAt: admin.firestore.Timestamp.now(),
    usage: {
      OpenVAS: {
        used: 3,
        limit: 200
      },
      nmap: {
        used: 5,
        limit: 200
      }
    }
  };

  try {
    await db.collection('users').doc(userId).set(userData);
    console.log('✅ User document created successfully!');
    console.log('User ID:', userId);
    console.log('Email:', userData.email);
    console.log('Plan:', userData.planTier);
    console.log('Status:', userData.subscriptionStatus);
  } catch (error) {
    console.error('❌ Error creating user document:', error);
  }
  
  process.exit(0);
}

createUserDocument();
