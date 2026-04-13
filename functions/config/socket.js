const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * Socket.IO Configuration
 * 
 * Handles real-time:
 * - Direct messages between users
 * - Circle/group chat messages
 * - Typing indicators
 * - Online status
 * - Notification push
 */
function initializeSocket(io) {
  // ─── Authentication Middleware ─────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
      const user = await User.findByPk(decoded.userId, {
        attributes: ["id", "username", "display_name", "avatar_url"],
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  // ─── Connection Handler ───────────────────────────────────────
  io.on("connection", (socket) => {
    const userId = socket.user.id;
    console.log(`🔌 User connected: ${socket.user.username} (${userId})`);

    // Join personal room for DM notifications
    socket.join(`user:${userId}`);

    // ── Join circle rooms ─────────────────────────────────────
    socket.on("join_circle", (circleId) => {
      socket.join(`circle:${circleId}`);
      console.log(`  → ${socket.user.username} joined circle:${circleId}`);
    });

    socket.on("leave_circle", (circleId) => {
      socket.leave(`circle:${circleId}`);
    });

    // ── Direct Message ────────────────────────────────────────
    socket.on("send_dm", (data) => {
      const { recipientId, content, messageId } = data;
      io.to(`user:${recipientId}`).emit("new_message", {
        id: messageId,
        sender: {
          id: userId,
          username: socket.user.username,
          display_name: socket.user.display_name,
          avatar_url: socket.user.avatar_url,
        },
        content,
        sent_at: new Date().toISOString(),
      });
    });

    // ── Circle/Group Chat Message ─────────────────────────────
    socket.on("send_circle_message", (data) => {
      const { circleId, content, messageId } = data;
      socket.to(`circle:${circleId}`).emit("circle_message", {
        id: messageId,
        sender: {
          id: userId,
          username: socket.user.username,
          display_name: socket.user.display_name,
          avatar_url: socket.user.avatar_url,
        },
        circle_id: circleId,
        content,
        sent_at: new Date().toISOString(),
      });
    });

    // ── Typing Indicators ─────────────────────────────────────
    socket.on("typing_start", (data) => {
      if (data.circleId) {
        socket.to(`circle:${data.circleId}`).emit("user_typing", {
          userId,
          username: socket.user.username,
          circleId: data.circleId,
        });
      } else if (data.recipientId) {
        io.to(`user:${data.recipientId}`).emit("user_typing", {
          userId,
          username: socket.user.username,
        });
      }
    });

    socket.on("typing_stop", (data) => {
      if (data.circleId) {
        socket.to(`circle:${data.circleId}`).emit("user_stopped_typing", { userId });
      } else if (data.recipientId) {
        io.to(`user:${data.recipientId}`).emit("user_stopped_typing", { userId });
      }
    });

    // ── Read Receipts ─────────────────────────────────────────
    socket.on("mark_read", (data) => {
      const { senderId } = data;
      io.to(`user:${senderId}`).emit("messages_read", { readBy: userId });
    });

    // ── Disconnect ────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${socket.user.username}`);
    });
  });

  return io;
}

module.exports = initializeSocket;
