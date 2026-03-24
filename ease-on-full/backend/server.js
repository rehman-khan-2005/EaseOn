require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const { sequelize } = require("./models");
const initializeSocket = require("./config/socket");

// ─── Initialize Express ─────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Initialize Socket.IO ───────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

initializeSocket(io);
app.set("io", io); // Make io accessible in controllers

// ─── Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ─────────────────────────────────────────────────────
// All routes mounted under /api matching the architecture diagram:
//   /api/users, /api/moods, /api/journals, /api/circles, /api/messages, /api/notifications
app.use("/api", routes);

// ─── Root endpoint ──────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    name: "Ease-On API",
    version: "1.0.0",
    description: "Community Wellness App Backend",
    endpoints: {
      health: "/api/health",
      users: "/api/users",
      moods: "/api/moods",
      journals: "/api/journals",
      circles: "/api/circles",
      messages: "/api/messages",
      notifications: "/api/notifications",
    },
  });
});

// ─── Error Handler ──────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

async function start() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Sync models (creates tables if they don't exist)
    // In production, use migrations instead of sync
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      console.log("✅ Database models synced");
    }

    // Start listening
    server.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🌿  Ease-On API Server                                ║
║                                                          ║
║   HTTP:      http://localhost:${PORT}                     ║
║   Socket.IO: ws://localhost:${PORT}                       ║
║   Health:    http://localhost:${PORT}/api/health           ║
║   Env:       ${process.env.NODE_ENV || "development"}                          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

start();

module.exports = { app, server, io };
