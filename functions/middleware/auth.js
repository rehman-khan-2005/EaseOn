const admin = require("firebase-admin");

// Initialize Firebase Admin — Cloud Functions has built-in credentials
if (!admin.apps.length) {
  admin.initializeApp();
}

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    // Verify the Firebase ID token
    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUid = decoded.uid;
    req.firebaseEmail = decoded.email;

    // Find or create user in our database
    const { User } = require("../models");
    let user = await User.findOne({ where: { firebase_uid: decoded.uid } });

    if (!user) {
      // Try matching by email
      user = await User.findOne({ where: { email: decoded.email } });
      if (user) {
        user.firebase_uid = decoded.uid;
        await user.save();
      }
    }

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Middleware that requires user to exist in DB
const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(404).json({ error: "User profile not found. Please register first." });
  }
  next();
};

module.exports = { authenticate, requireUser };
