// Script to initialize user document in Firestore
// Run with: node scripts/init-user.js

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

// Initialize Firebase Admin
const serviceAccount = {
  projectId: env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeUser() {
  const uid = 'B5VNdoI7uJYtNClYIpAaGEqWOPr2';
  
  const userData = {
    uid: uid,
    email: 'zackelmetennani@gmail.com', // Update if different
    planTier: 'pro',
    subscriptionStatus: 'active',
    cycleStart: admin.firestore.Timestamp.now(),
    lastResetAt: admin.firestore.Timestamp.now(),
    stripeCustomerId: '', // Will be set by webhook
    subscriptionId: '', // Will be set by webhook
    usage: {
      vulnerability: {
        used: 15,
        limit: 200
      },
      portScan: {
        used: 8,
        limit: 200
      },
      malwareAnalysis: {
        used: 3,
        limit: 50
      },
      dnsRecon: {
        used: 5,
        limit: 100
      }
    }
  };

  try {
    await db.collection('users').doc(uid).set(userData);
    console.log('✅ User document created successfully!');
    console.log('📊 Stats:');
    console.log(`   - Plan: ${userData.planTier}`);
    console.log(`   - Status: ${userData.subscriptionStatus}`);
    console.log(`   - Total usage: 31 / 550 scans`);
    console.log('\n🎯 Next: Visit your dashboard to see the data!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user document:', error);
    process.exit(1);
  }
}

initializeUser();
