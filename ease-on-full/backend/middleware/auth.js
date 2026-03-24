const admin = require("../config/firebase");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * Authentication Middleware
 * 
 * Supports two modes:
 * 1. Firebase Auth — verifies Firebase ID token from Authorization header
 * 2. JWT Fallback  — verifies JWT when Firebase is not configured
 * 
 * Attaches req.user with the authenticated user record from DB.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    let userId;

    // Try Firebase first
    if (admin.apps && admin.apps.length > 0) {
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        // Find user by Firebase UID
        const user = await User.findOne({ where: { firebase_uid: decoded.uid } });
        if (!user) {
          return res.status(401).json({ error: "User not found. Please register first." });
        }
        req.user = user;
        req.firebaseUser = decoded;
        return next();
      } catch (firebaseErr) {
        // If Firebase fails, fall through to JWT
        console.log("Firebase auth failed, trying JWT fallback...");
      }
    }

    // JWT fallback
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
      userId = decoded.userId;
    } catch (jwtErr) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

/**
 * Optional authentication — attaches user if token present, continues otherwise
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  return authenticate(req, res, next);
}

module.exports = { authenticate, optionalAuth };
