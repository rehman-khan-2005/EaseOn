const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const circleMessageController = require("../controllers/circleMessageController");

// All routes require auth
router.use(authenticate);

// GET /api/circles/:id/messages — fetch group chat history
router.get("/:id/messages", circleMessageController.getMessages);

// POST /api/circles/:id/messages — send a group chat message
router.post("/:id/messages", circleMessageController.sendMessage);

module.exports = router;
