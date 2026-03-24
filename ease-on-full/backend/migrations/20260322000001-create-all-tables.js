"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ─── 1. USERS ───────────────────────────────────────────────
    await queryInterface.createTable("users", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      username: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: true },
      auth_provider: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "email" },
      display_name: { type: Sequelize.STRING(100), allowNull: true },
      avatar_url: { type: Sequelize.STRING(500), allowNull: true },
      karma_score: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      is_anonymous: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      firebase_uid: { type: Sequelize.STRING(128), allowNull: true, unique: true },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
    await queryInterface.addIndex("users", ["karma_score"]);

    // ─── 2. MOOD_CHECK_INS ──────────────────────────────────────
    await queryInterface.createTable("mood_check_ins", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: "users", key: "id" }, onDelete: "CASCADE" },
      mood_value: { type: Sequelize.INTEGER, allowNull: false },
      emoji_label: { type: Sequelize.STRING(20), allowNull: false },
      reflection: { type: Sequelize.TEXT, allowNull: true },
      checked_in_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
    await queryInterface.addIndex("mood_check_ins", ["user_id", "checked_in_at"]);

    // ─── 3. JOURNAL_ENTRIES ─────────────────────────────────────
    await queryInterface.createTable("journal_entries", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: "users", key: "id" }, onDelete: "CASCADE" },
      title: { type: Sequelize.STRING(200), allowNull: true },
      body: { type: Sequelize.TEXT, allowNull: false },
      visibility: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "private" },
      mood_value: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
    await queryInterface.addIndex("journal_entries", ["user_id"]);
    await queryInterface.addIndex("journal_entries", ["visibility"]);

    // ─── 4. SUPPORT_CIRCLES ────────────────────────────────────
    await queryInterface.createTable("support_circles", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      creator_id: { type: Sequelize.UUID, allowNull: false, references: { model: "users", key: "id" }, onDelete: "CASCADE" },
      name: { type: Sequelize.STRING(100), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      visibility: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "public" },
      member_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
    await queryInterface.addIndex("support_circles", ["creator_id"]);
    await queryInterface.addIndex("support_circles", ["name"]);

    // ─── 5. CIRCLE_MEMBERSHIPS (junction table) ────────────────
    await queryInterface.createTable("circle_memberships", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      circle_id: { type: Sequelize.UUID, allowNull: false, references: { model: "support_circles", key: "id" }, onDelete: "CASCADE" },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: "users", key: "id" }, onDelete: "CASCADE" },
      role: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "member" },
      joined_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
    await queryInterface.addIndex("circle_memberships", { fields: ["circle_id", "user_id"], unique: true });

    // ─── 6. MESSAGES ───────────────────────────────────────────
    await queryInterface.createTable("messages", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      sender_id: { type: Sequelize.UUID, allowNull: false, references: { model: "users", key: "id" }, onDelete: "CASCADE" },
      recipient_id: { type: Sequelize.UUID, allowNull: true, references: { model: "users", key: "id" }, onDelete: "SET NULL" },
      circle_id: { type: Sequelize.UUID, allowNull: true, references: { model: "support_circles", key: "id" }, onDelete: "CASCADE" },
      content: { type: Sequelize.TEXT, allowNull: false },
      is_read: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      sent_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
    await queryInterface.addIndex("messages", ["sender_id", "recipient_id"]);
    await queryInterface.addIndex("messages", ["circle_id"]);
    await queryInterface.addIndex("messages", ["sent_at"]);

    // ─── 7. NOTIFICATIONS ──────────────────────────────────────
    await queryInterface.createTable("notifications", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: "users", key: "id" }, onDelete: "CASCADE" },
      type: { type: Sequelize.STRING(30), allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: false },
      reference_id: { type: Sequelize.UUID, allowNull: true },
      is_read: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
    await queryInterface.addIndex("notifications", ["user_id", "is_read"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("notifications");
    await queryInterface.dropTable("messages");
    await queryInterface.dropTable("circle_memberships");
    await queryInterface.dropTable("support_circles");
    await queryInterface.dropTable("journal_entries");
    await queryInterface.dropTable("mood_check_ins");
    await queryInterface.dropTable("users");
  },
};
