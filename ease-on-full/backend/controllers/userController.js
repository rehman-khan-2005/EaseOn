const userService = require("../services/userService");

class UserController {
  async register(req, res, next) {
    try {
      const { username, email, password, display_name, auth_provider, firebase_uid } = req.body;
      const result = await userService.register({
        username,
        email,
        password_hash: password, // In production: hash with bcrypt first
        display_name,
        auth_provider,
        firebase_uid,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await userService.login({
        email,
        password_hash: password, // In production: compare with bcrypt
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async firebaseAuth(req, res, next) {
    try {
      // req.firebaseUser is set by auth middleware when Firebase token is valid
      const user = await userService.findOrCreateFromFirebase(req.firebaseUser);
      const token = userService.generateToken(user.id);
      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.params.id || req.user.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user.id, req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async getTopContributors(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const contributors = await userService.getTopContributors(limit);
      res.json(contributors);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
