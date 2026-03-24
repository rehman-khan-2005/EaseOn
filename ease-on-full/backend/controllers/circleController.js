const circleService = require("../services/circleService");

class CircleController {
  async create(req, res, next) {
    try {
      const { name, description, visibility } = req.body;
      const circle = await circleService.create(req.user.id, { name, description, visibility });
      res.status(201).json({ message: "Circle created", circle });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const search = req.query.search;
      const result = await circleService.getAll({ page, limit, search });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getJoined(req, res, next) {
    try {
      const circles = await circleService.getJoined(req.user.id);
      res.json(circles);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const circle = await circleService.getById(req.params.id);
      res.json(circle);
    } catch (err) {
      next(err);
    }
  }

  async join(req, res, next) {
    try {
      const result = await circleService.join(req.user.id, req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async leave(req, res, next) {
    try {
      const result = await circleService.leave(req.user.id, req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateMemberRole(req, res, next) {
    try {
      const { target_user_id, role } = req.body;
      const membership = await circleService.updateMemberRole(
        req.user.id, req.params.id, target_user_id, role
      );
      res.json({ message: "Role updated", membership });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CircleController();
