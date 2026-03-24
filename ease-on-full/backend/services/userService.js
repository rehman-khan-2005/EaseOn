const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { Op } = require("sequelize");

class UserService {
  /**
   * Register a new user (email/password or Firebase)
   */
  async register({ username, email, password_hash, auth_provider, display_name, firebase_uid }) {
    const existing = await User.findOne({
      where: { [Op.or]: [{ email }, { username }] },
    });
    if (existing) {
      const field = existing.email === email ? "email" : "username";
      const err = new Error(`${field} already exists`);
      err.statusCode = 409;
      throw err;
    }

    const user = await User.create({
      username,
      email,
      password_hash,
      auth_provider: auth_provider || "email",
      display_name: display_name || username,
      firebase_uid,
    });

    const token = this.generateToken(user.id);
    return { user: this.sanitize(user), token };
  }

  /**
   * Login with email (JWT mode)
   */
  async login({ email, password_hash }) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      throw err;
    }
    // In production, use bcrypt.compare(password, user.password_hash)
    if (user.password_hash !== password_hash) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      throw err;
    }

    const token = this.generateToken(user.id);
    return { user: this.sanitize(user), token };
  }

  /**
   * Find or create user from Firebase token data
   */
  async findOrCreateFromFirebase(firebaseUser) {
    let user = await User.findOne({ where: { firebase_uid: firebaseUser.uid } });

    if (!user) {
      user = await User.create({
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email || `${firebaseUser.uid}@firebase.local`,
        username: firebaseUser.email?.split("@")[0] || `user_${firebaseUser.uid.slice(0, 8)}`,
        display_name: firebaseUser.name || firebaseUser.email?.split("@")[0],
        auth_provider: firebaseUser.firebase?.sign_in_provider || "firebase",
        avatar_url: firebaseUser.picture || null,
      });
    }

    return this.sanitize(user);
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    return this.sanitize(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    const allowed = ["display_name", "avatar_url", "is_anonymous", "phone", "username"];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    }

    await user.save();
    return this.sanitize(user);
  }

  /**
   * Top Contributor / Karma system
   * Retrieves users ranked by karma_score (Reddit-style ranking)
   */
  async getTopContributors(limit = 10) {
    const users = await User.findAll({
      order: [["karma_score", "DESC"]],
      limit,
      attributes: ["id", "username", "display_name", "avatar_url", "karma_score"],
    });
    return users;
  }

  /**
   * Award karma points to a user
   */
  async awardKarma(userId, points) {
    const user = await User.findByPk(userId);
    if (!user) return;
    user.karma_score += points;
    await user.save();
    return user.karma_score;
  }

  // ─── Helpers ────────────────────────────────────────────────────
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: process.env.JWT_EXPIRATION || "7d" }
    );
  }

  sanitize(user) {
    const u = user.toJSON();
    delete u.password_hash;
    delete u.firebase_uid;
    return u;
  }
}

module.exports = new UserService();
