const notificationService = require("../services/notificationService");

class NotificationController {
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const unread_only = req.query.unread_only === "true";
      const result = await notificationService.getAll(req.user.id, { page, limit, unread_only });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async markRead(req, res, next) {
    try {
      const notif = await notificationService.markRead(req.user.id, req.params.id);
      res.json(notif);
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req, res, next) {
    try {
      await notificationService.markAllRead(req.user.id);
      res.json({ message: "All notifications marked as read" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
