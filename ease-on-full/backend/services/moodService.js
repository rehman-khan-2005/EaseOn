const { MoodCheckIn, sequelize } = require("../models");
const { Op, fn, col, literal } = require("sequelize");

class MoodService {
  /**
   * 1.0 Log Mood (matching Level 2 DFD: Select Emoji → Enter Level → Validate → Save)
   */
  async logMood(userId, { mood_value, emoji_label, reflection }) {
    // 1.3 Validate Mood Input
    if (mood_value < 1 || mood_value > 5) {
      const err = new Error("Mood value must be between 1 and 5");
      err.statusCode = 400;
      throw err;
    }

    const validLabels = ["awful", "bad", "okay", "good", "great"];
    if (!validLabels.includes(emoji_label)) {
      const err = new Error("Invalid emoji label");
      err.statusCode = 400;
      throw err;
    }

    // 1.4 Save Mood Entry to D1 Mood Data Store
    const checkIn = await MoodCheckIn.create({
      user_id: userId,
      mood_value,
      emoji_label,
      reflection,
      checked_in_at: new Date(),
    });

    return checkIn;
  }

  /**
   * 4.0 View Mood History (matching Level 2 DFD)
   * 4.1 Request → 4.2 Retrieve Mood Data → 4.4 Generate Graph → 4.5 Display
   */
  async getMoodHistory(userId, { days = 30, page = 1, limit = 50 } = {}) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { rows, count } = await MoodCheckIn.findAndCountAll({
      where: {
        user_id: userId,
        checked_in_at: { [Op.gte]: since },
      },
      order: [["checked_in_at", "DESC"]],
      limit,
      offset: (page - 1) * limit,
    });

    return { moods: rows, total: count, page, pages: Math.ceil(count / limit) };
  }

  /**
   * Generate mood trends / graph data
   * Groups moods by day and calculates averages
   */
  async getMoodTrends(userId, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const trends = await MoodCheckIn.findAll({
      where: {
        user_id: userId,
        checked_in_at: { [Op.gte]: since },
      },
      attributes: [
        [fn("DATE", col("checked_in_at")), "date"],
        [fn("AVG", col("mood_value")), "avg_mood"],
        [fn("COUNT", col("id")), "check_in_count"],
        [fn("MODE", col("emoji_label")), "most_common_emoji"],
      ],
      group: [fn("DATE", col("checked_in_at"))],
      order: [[fn("DATE", col("checked_in_at")), "ASC"]],
      raw: true,
    });

    // Monthly mood counts (for profile insights)
    const monthlyCounts = await MoodCheckIn.findAll({
      where: {
        user_id: userId,
        checked_in_at: { [Op.gte]: since },
      },
      attributes: [
        "emoji_label",
        [fn("COUNT", col("id")), "count"],
      ],
      group: ["emoji_label"],
      raw: true,
    });

    // Calculate streak
    const streak = await this.calculateStreak(userId);

    return { trends, monthlyCounts, streak };
  }

  /**
   * Calculate consecutive day streak
   */
  async calculateStreak(userId) {
    const recentMoods = await MoodCheckIn.findAll({
      where: { user_id: userId },
      attributes: [[fn("DISTINCT", fn("DATE", col("checked_in_at"))), "date"]],
      order: [[fn("DATE", col("checked_in_at")), "DESC"]],
      limit: 365,
      raw: true,
    });

    if (recentMoods.length === 0) return 0;

    let streak = 1;
    const today = new Date().toISOString().split("T")[0];
    const dates = recentMoods.map((r) => r.date);

    // Check if today or yesterday has a check-in
    if (dates[0] !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (dates[0] !== yesterday.toISOString().split("T")[0]) return 0;
    }

    for (let i = 1; i < dates.length; i++) {
      const curr = new Date(dates[i - 1]);
      const prev = new Date(dates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else break;
    }

    return streak;
  }
}

module.exports = new MoodService();
