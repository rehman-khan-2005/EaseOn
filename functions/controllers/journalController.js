const journalService = require("../services/journalService");

class JournalController {
  async create(req, res, next) {
    try {
      const { title, body, visibility, mood_value } = req.body;
      const entry = await journalService.create(req.user.id, { title, body, visibility, mood_value });
      res.status(201).json({ message: "Journal entry created", entry });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const visibility = req.query.visibility;
      const result = await journalService.getAll(req.user.id, { page, limit, visibility });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const entry = await journalService.getById(req.user.id, req.params.id);
      res.json(entry);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const entry = await journalService.update(req.user.id, req.params.id, req.body);
      res.json({ message: "Journal entry updated", entry });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await journalService.delete(req.user.id, req.params.id);
      res.json({ message: "Journal entry deleted" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new JournalController();
