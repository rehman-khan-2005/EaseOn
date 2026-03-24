const admin = require("firebase-admin");
const path = require("path");

/**
 * Initialize Firebase Admin SDK
 * 
 * Setup instructions:
 * 1. Go to Firebase Console > Project Settings > Service Accounts
 * 2. Click "Generate New Private Key"
 * 3. Save the JSON file as firebase-service-account.json in project root
 * 4. Set FIREBASE_PROJECT_ID in your .env
 */
function initializeFirebase() {
  // Check if already initialized
  if (admin.apps.length > 0) {
    return admin;
  }

  try {
    const serviceAccountPath = path.join(__dirname, "..", "firebase-service-account.json");
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    console.log("✅ Firebase Admin SDK initialized");
  } catch (error) {
    // Fallback: initialize without service account for development
    console.warn("⚠️  Firebase service account not found. Running in JWT-only mode.");
    console.warn("   To enable Firebase Auth, add firebase-service-account.json to project root.");
    
    // Initialize with project ID only (limited functionality)
    if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
  }

  return admin;
}

module.exports = initializeFirebase();
