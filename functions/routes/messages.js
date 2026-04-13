const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const messageController = require("../controllers/messageController");

router.use(authenticate);

// GET /api/messages/inbox — Get conversation list
router.get("/inbox", messageController.getInbox);

// POST /api/messages/direct — Send a DM
router.post(
  "/direct",
  [
    body("recipient_id").isUUID().withMessage("Valid recipient ID required"),
    body("content").notEmpty().withMessage("Message content required"),
    validate,
  ],
  messageController.sendDirect
);

// GET /api/messages/direct/:userId — Get DM conversation
router.get("/direct/:userId", messageController.getConversation);

// PUT /api/messages/read/:senderId — Mark messages from sender as read
router.put("/read/:senderId", messageController.markRead);

// POST /api/messages/circle/:circleId — Send message to circle group chat
router.post(
  "/circle/:circleId",
  [body("content").notEmpty().withMessage("Message content required"), validate],
  messageController.sendToCircle
);

// GET /api/messages/circle/:circleId — Get circle chat messages
router.get("/circle/:circleId", messageController.getCircleMessages);

module.exports = router;
