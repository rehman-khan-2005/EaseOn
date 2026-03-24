const { JournalEntry } = require("../models");
const { Op } = require("sequelize");

class JournalService {
  /**
   * 2.0 Create Journal Entry (matching Level 2 DFD)
   * 2.1 Enter Reflection Text → 2.4 Validate → 2.5 Save to D2 Journal Data Store
   */
  async create(userId, { title, body, visibility, mood_value }) {
    // 2.4 Validate Journal Entry
    if (!body || body.trim().length === 0) {
      const err = new Error("Journal entry body cannot be empty");
      err.statusCode = 400;
      throw err;
    }

    // 2.5 Save Journal Entry
    const entry = await JournalEntry.create({
      user_id: userId,
      title,
      body,
      visibility: visibility || "private",
      mood_value,
    });

    return entry;
  }

  /**
   * 2.2 Load Existing Entry + 2.3 Edit Existing Entry
   */
  async update(userId, entryId, updates) {
    // 2.2 Load Existing Entry from Journal Data Store
    const entry = await JournalEntry.findOne({
      where: { id: entryId, user_id: userId },
    });

    if (!entry) {
      const err = new Error("Journal entry not found");
      err.statusCode = 404;
      throw err;
    }

    // 2.3 Edit Existing Entry
    const allowed = ["title", "body", "visibility", "mood_value"];
    for (const key of allowed) {
      if (updates[key] !== undefined) entry[key] = updates[key];
    }

    // 2.4 Validate again → 2.5 Save back
    await entry.save();
    return entry;
  }

  /**
   * Get single entry
   */
  async getById(userId, entryId) {
    const entry = await JournalEntry.findOne({
      where: { id: entryId, user_id: userId },
    });
    if (!entry) {
      const err = new Error("Journal entry not found");
      err.statusCode = 404;
      throw err;
    }
    return entry;
  }

  /**
   * Get all entries for user (for Journal Screen)
   */
  async getAll(userId, { page = 1, limit = 20, visibility } = {}) {
    const where = { user_id: userId };
    if (visibility) where.visibility = visibility;

    const { rows, count } = await JournalEntry.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset: (page - 1) * limit,
    });

    return { entries: rows, total: count, page, pages: Math.ceil(count / limit) };
  }

  /**
   * Delete entry
   */
  async delete(userId, entryId) {
    const entry = await JournalEntry.findOne({
      where: { id: entryId, user_id: userId },
    });
    if (!entry) {
      const err = new Error("Journal entry not found");
      err.statusCode = 404;
      throw err;
    }
    await entry.destroy();
    return { deleted: true };
  }
}

module.exports = new JournalService();
