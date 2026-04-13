const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const notificationController = require("../controllers/notificationController");

router.use(authenticate);

// GET /api/notifications — Get all notifications
router.get("/", notificationController.getAll);

// PUT /api/notifications/read-all — Mark all as read
router.put("/read-all", notificationController.markAllRead);

// PUT /api/notifications/:id/read — Mark single as read
router.put("/:id/read", notificationController.markRead);

module.exports = router;
