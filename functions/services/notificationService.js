const { Notification, User } = require("../models");
const admin = require("firebase-admin");

class NotificationService {
  /**
   * Create a notification for a user and send FCM push if token exists
   */
  async create(userId, { type, content, reference_id }) {
    const notif = await Notification.create({
      user_id: userId,
      type,
      content,
      reference_id,
    });

    // Send FCM push notification
    try {
      const user = await User.findByPk(userId, { attributes: ["fcm_token"] });
      if (user && user.fcm_token) {
        await admin.messaging().send({
          token: user.fcm_token,
          notification: {
            title: "Ease-On",
            body: content,
          },
          data: {
            type: type || "general",
            reference_id: reference_id || "",
          },
        });
      }
    } catch (e) {
      // FCM send failed — token may be expired, don't crash
      if (e.code === "messaging/registration-token-not-registered" || e.code === "messaging/invalid-registration-token") {
        // Clear invalid token
        await User.update({ fcm_token: null }, { where: { id: userId } });
      }
      console.log("FCM push error:", e.message);
    }

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
