const messageService = require("../services/messageService");
const notificationService = require("../services/notificationService");

class MessageController {
  async sendDirect(req, res, next) {
    try {
      const { recipient_id, content } = req.body;
      const message = await messageService.sendDirect(req.user.id, recipient_id, content);

      // Notify recipient
      await notificationService.notifyNewMessage(
        recipient_id,
        req.user.display_name || req.user.username
      );

      // Emit via Socket.IO if available
      if (req.app.get("io")) {
        req.app.get("io").to(`user:${recipient_id}`).emit("new_message", {
          message,
          sender: { id: req.user.id, username: req.user.username, display_name: req.user.display_name },
        });
      }

      res.status(201).json({ message: "Message sent", data: message });
    } catch (err) {
      next(err);
    }
  }

  async sendToCircle(req, res, next) {
    try {
      const { content } = req.body;
      const message = await messageService.sendToCircle(req.user.id, req.params.circleId, content);

      // Emit to circle room via Socket.IO
      if (req.app.get("io")) {
        req.app.get("io").to(`circle:${req.params.circleId}`).emit("circle_message", {
          message,
          sender: { id: req.user.id, username: req.user.username, display_name: req.user.display_name },
        });
      }

      res.status(201).json({ message: "Message sent to circle", data: message });
    } catch (err) {
      next(err);
    }
  }

  async getConversation(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const result = await messageService.getConversation(req.user.id, req.params.userId, { page, limit });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getCircleMessages(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const result = await messageService.getCircleMessages(req.user.id, req.params.circleId, { page, limit });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getInbox(req, res, next) {
    try {
      const inbox = await messageService.getInbox(req.user.id);
      res.json(inbox);
    } catch (err) {
      next(err);
    }
  }

  async markRead(req, res, next) {
    try {
      await messageService.markRead(req.user.id, req.params.senderId);
      res.json({ message: "Messages marked as read" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MessageController();
