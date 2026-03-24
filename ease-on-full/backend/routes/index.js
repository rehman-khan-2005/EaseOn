const router = require("express").Router();

router.use("/users", require("./users"));
router.use("/moods", require("./moods"));
router.use("/journals", require("./journals"));
router.use("/circles", require("./circles"));
router.use("/messages", require("./messages"));
router.use("/notifications", require("./notifications"));

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

module.exports = router;
