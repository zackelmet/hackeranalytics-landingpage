// Firestore Schema Setup Guide
// Execute this in your browser console on Firebase Console's Firestore page
// Or use this as a reference to manually create the structure

/*
Collection: users
Document ID: {uid} (your Firebase Auth user ID)

Example structure with nested usage map:
*/

const exampleUserDocument = {
  uid: "YOUR_FIREBASE_UID_HERE",
  email: "user@example.com",
  stripeCustomerId: "cus_123456789", // Set by Stripe webhook
  subscriptionId: "sub_987654321", // Set by Stripe webhook
  planTier: "pro", // Options: "basic", "pro", "premium"
  cycleStart: new Date(), // Timestamp - start of billing cycle
  lastResetAt: new Date(), // Timestamp - when usage was last reset
  subscriptionStatus: "active", // Options: "active", "trialing", "inactive", "canceled"
  
  // NEW: Per-scanner usage tracking (nested map)
  usage: {
    vulnerability: {
      used: 0,
      limit: 200  // Tier-specific limit
    },
    portScan: {
      used: 0,
      limit: 200
    },
    malwareAnalysis: {
      used: 0,
      limit: 50  // Premium-only feature
    },
    dnsRecon: {
      used: 0,
      limit: 100
    }
    // Easy to add more scanner types as needed
  }
};

/*
To set up in Firebase Console:

1. Go to: https://console.firebase.google.com
2. Select your project
3. Click "Firestore Database" in the left sidebar
4. Click "Start collection"
5. Collection ID: "users"
6. Document ID: Use your Firebase Auth UID (get it from Authentication tab)
7. Add these fields:
   - uid (string): your Firebase Auth UID
   - email (string): your email
   - planTier (string): "basic" or "pro" or "premium"
   - subscriptionStatus (string): "active"
   - cycleStart (timestamp): Click "Use current time"
   - lastResetAt (timestamp): Click "Use current time"
   - stripeCustomerId (string): Leave empty for now (webhook will set)
   - subscriptionId (string): Leave empty for now (webhook will set)
   
8. Add nested map for usage:
   - Click "Add field"
   - Field name: "usage"
   - Type: "map"
   - Add nested fields within the map:
     - vulnerability (map):
       - used (number): 0
       - limit (number): 200
     - portScan (map):
       - used (number): 0
       - limit (number): 200
     - malwareAnalysis (map):
       - used (number): 0
       - limit (number): 50
     - dnsRecon (map):
       - used (number): 0
       - limit (number): 100

9. Click "Save"

TIER-SPECIFIC LIMITS:
Basic ($8/mo):
  - vulnerability: 50
  - portScan: 50
  - dnsRecon: 25
  - malwareAnalysis: 0 (not included)

Pro ($20/mo):
  - vulnerability: 200
  - portScan: 200
  - dnsRecon: 100
  - malwareAnalysis: 50

Premium ($99/mo):
  - vulnerability: 999999 (unlimited)
  - portScan: 999999 (unlimited)
  - dnsRecon: 999999 (unlimited)
  - malwareAnalysis: 999999 (unlimited)
*/
