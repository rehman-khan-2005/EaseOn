const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const moodController = require("../controllers/moodController");

// All mood routes require authentication
router.use(authenticate);

// POST /api/moods — Log a mood check-in
router.post(
  "/",
  [
    body("mood_value").isInt({ min: 1, max: 5 }).withMessage("Mood value must be 1-5"),
    body("emoji_label").isIn(["awful", "bad", "okay", "good", "great"]).withMessage("Invalid emoji label"),
    body("reflection").optional().isString(),
    validate,
  ],
  moodController.logMood
);

// GET /api/moods — Get mood history
router.get("/", moodController.getHistory);

// GET /api/moods/trends — Get mood trends for graph
router.get("/trends", moodController.getTrends);

module.exports = router;
