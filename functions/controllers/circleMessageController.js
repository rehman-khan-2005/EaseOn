const { CircleMessage, User } = require("../models");

class CircleMessageController {
  async getMessages(req, res, next) {
    try {
      const circleId = req.params.id;
      const messages = await CircleMessage.findAll({
        where: { circle_id: circleId },
        order: [["created_at", "ASC"]],
        limit: 200,
        include: [{
          model: User,
          as: "sender",
          attributes: ["id", "username", "display_name", "avatar_url"],
        }],
      });
      const out = messages.map(m => ({
        id: m.id,
        circle_id: m.circle_id,
        sender_id: m.sender_id,
        content: m.content,
        created_at: m.created_at,
        sender: m.sender ? {
          id: m.sender.id,
          username: m.sender.username,
          display_name: m.sender.display_name,
          avatar_url: m.sender.avatar_url,
        } : null,
      }));
      res.json({ messages: out });
    } catch (err) {
      next(err);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const circleId = req.params.id;
      const { content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ error: "Message content required" });
      }
      const msg = await CircleMessage.create({
        circle_id: circleId,
        sender_id: req.user.id,
        content: content.trim(),
      });
      res.status(201).json({
        id: msg.id,
        circle_id: msg.circle_id,
        sender_id: msg.sender_id,
        content: msg.content,
        created_at: msg.created_at,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CircleMessageController();
