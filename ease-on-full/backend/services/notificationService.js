const { Notification } = require("../models");

class NotificationService {
  /**
   * Create a notification for a user
   */
  async create(userId, { type, content, reference_id }) {
    const notif = await Notification.create({
      user_id: userId,
      type,
      content,
      reference_id,
    });
    return notif;
  }

  /**
   * Get all notifications for a user
   */
  async getAll(userId, { page = 1, limit = 30, unread_only = false } = {}) {
    const where = { user_id: userId };
    if (unread_only) where.is_read = false;

    const { rows, count } = await Notification.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset: (page - 1) * limit,
    });

    return {
      notifications: rows,
      total: count,
      unread: await Notification.count({ where: { user_id: userId, is_read: false } }),
      page,
      pages: Math.ceil(count / limit),
    };
  }

  /**
   * Mark a single notification as read
   */
  async markRead(userId, notifId) {
    const notif = await Notification.findOne({
      where: { id: notifId, user_id: userId },
    });
    if (!notif) {
      const err = new Error("Notification not found");
      err.statusCode = 404;
      throw err;
    }
    notif.is_read = true;
    await notif.save();
    return notif;
  }

  /**
   * Mark all notifications as read
   */
  async markAllRead(userId) {
    await Notification.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } }
    );
    return { marked: true };
  }

  // ─── Notification helpers for other services ─────────────────────
  async notifyCircleInvite(userId, circleId, inviterName) {
    return this.create(userId, {
      type: "circle_invite",
      content: `${inviterName} invited you to join a circle`,
      reference_id: circleId,
    });
  }

  async notifyNewMessage(userId, senderName) {
    return this.create(userId, {
      type: "new_message",
      content: `New message from ${senderName}`,
    });
  }

  async notifyKarmaMilestone(userId, karmaScore) {
    return this.create(userId, {
      type: "karma_milestone",
      content: `You reached ${karmaScore} karma points! 🎉`,
    });
  }

  async notifyCirclePost(userId, circleTag, posterName) {
    return this.create(userId, {
      type: "circle_post",
      content: `${posterName} posted in ${circleTag}`,
    });
  }
}

module.exports = new NotificationService();
