const moodService = require("../services/moodService");
const userService = require("../services/userService");

class MoodController {
  async logMood(req, res, next) {
    try {
      const { mood_value, emoji_label, reflection } = req.body;
      const checkIn = await moodService.logMood(req.user.id, {
        mood_value,
        emoji_label,
        reflection,
      });

      // Award karma for logging mood
      await userService.awardKarma(req.user.id, 1);

      res.status(201).json({ message: "Mood logged successfully", checkIn });
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 30;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const result = await moodService.getMoodHistory(req.user.id, { days, page, limit });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getTrends(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 30;
      const result = await moodService.getMoodTrends(req.user.id, days);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MoodController();
