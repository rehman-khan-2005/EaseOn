const { Message, User, CircleMembership } = require("../models");
const { Op } = require("sequelize");

class MessageService {
  /**
   * Send a direct message to another user
   */
  async sendDirect(senderId, recipientId, content) {
    if (!content || content.trim().length === 0) {
      const err = new Error("Message content cannot be empty");
      err.statusCode = 400;
      throw err;
    }

    const recipient = await User.findByPk(recipientId);
    if (!recipient) {
      const err = new Error("Recipient not found");
      err.statusCode = 404;
      throw err;
    }

    const message = await Message.create({
      sender_id: senderId,
      recipient_id: recipientId,
      circle_id: null,
      content: content.trim(),
      sent_at: new Date(),
    });

    return message;
  }

  /**
   * Send a group/circle message
   */
  async sendToCircle(senderId, circleId, content) {
    if (!content || content.trim().length === 0) {
      const err = new Error("Message content cannot be empty");
      err.statusCode = 400;
      throw err;
    }

    // Verify sender is a member of the circle
    const membership = await CircleMembership.findOne({
      where: { circle_id: circleId, user_id: senderId },
    });
    if (!membership) {
      const err = new Error("You must be a member of this circle to send messages");
      err.statusCode = 403;
      throw err;
    }

    const message = await Message.create({
      sender_id: senderId,
      recipient_id: null,
      circle_id: circleId,
      content: content.trim(),
      sent_at: new Date(),
    });

    return message;
  }

  /**
   * Get DM conversation between two users
   */
  async getConversation(userId, otherUserId, { page = 1, limit = 50 } = {}) {
    const { rows, count } = await Message.findAndCountAll({
      where: {
        circle_id: null,
        [Op.or]: [
          { sender_id: userId, recipient_id: otherUserId },
          { sender_id: otherUserId, recipient_id: userId },
        ],
      },
      order: [["sent_at", "ASC"]],
      limit,
      offset: (page - 1) * limit,
      include: [
        { model: User, as: "sender", attributes: ["id", "username", "display_name", "avatar_url"] },
      ],
    });

    return { messages: rows, total: count, page, pages: Math.ceil(count / limit) };
  }

  /**
   * Get circle/group chat messages
   */
  async getCircleMessages(userId, circleId, { page = 1, limit = 50 } = {}) {
    // Verify membership
    const membership = await CircleMembership.findOne({
      where: { circle_id: circleId, user_id: userId },
    });
    if (!membership) {
      const err = new Error("You must be a member to view circle messages");
      err.statusCode = 403;
      throw err;
    }

    const { rows, count } = await Message.findAndCountAll({
      where: { circle_id: circleId },
      order: [["sent_at", "ASC"]],
      limit,
      offset: (page - 1) * limit,
      include: [
        { model: User, as: "sender", attributes: ["id", "username", "display_name", "avatar_url"] },
      ],
    });

    return { messages: rows, total: count, page, pages: Math.ceil(count / limit) };
  }

  /**
   * Get list of conversations (inbox) for a user
   */
  async getInbox(userId) {
    // Get latest message per conversation partner
    const messages = await Message.findAll({
      where: {
        circle_id: null,
        [Op.or]: [{ sender_id: userId }, { recipient_id: userId }],
      },
      order: [["sent_at", "DESC"]],
      include: [
        { model: User, as: "sender", attributes: ["id", "username", "display_name", "avatar_url"] },
        { model: User, as: "recipient", attributes: ["id", "username", "display_name", "avatar_url"] },
      ],
    });

    // Deduplicate by conversation partner
    const seen = new Set();
    const inbox = [];
    for (const msg of messages) {
      const partnerId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
      if (!seen.has(partnerId)) {
        seen.add(partnerId);
        const partner = msg.sender_id === userId ? msg.recipient : msg.sender;
        inbox.push({
          partner,
          lastMessage: {
            content: msg.content,
            sent_at: msg.sent_at,
            is_read: msg.is_read,
            from_me: msg.sender_id === userId,
          },
          unread: await Message.count({
            where: {
              sender_id: partnerId,
              recipient_id: userId,
              is_read: false,
              circle_id: null,
            },
          }),
        });
      }
    }

    return inbox;
  }

  /**
   * Mark messages as read
   */
  async markRead(userId, senderId) {
    await Message.update(
      { is_read: true },
      {
        where: {
          sender_id: senderId,
          recipient_id: userId,
          is_read: false,
          circle_id: null,
        },
      }
    );
    return { marked: true };
  }
}

module.exports = new MessageService();
