"use strict";
const { v4: uuid } = require("uuid");

const USER_IDS = {
  sarah: uuid(),
  alex: uuid(),
  jordan: uuid(),
  sam: uuid(),
};

const CIRCLE_IDS = {
  recover: uuid(),
  depression: uuid(),
  anxiety: uuid(),
  mindfulness: uuid(),
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // ─── Users ────────────────────────────────────────────────
    await queryInterface.bulkInsert("users", [
      { id: USER_IDS.sarah, username: "sarah10", email: "sarah@example.com", password_hash: "hashed_pw", auth_provider: "email", display_name: "Sarah", karma_score: 48, is_anonymous: false, created_at: new Date(), updated_at: new Date() },
      { id: USER_IDS.alex, username: "alexm", email: "alex@example.com", password_hash: "hashed_pw", auth_provider: "email", display_name: "Alex M.", karma_score: 142, is_anonymous: false, created_at: new Date(), updated_at: new Date() },
      { id: USER_IDS.jordan, username: "jordanl", email: "jordan@example.com", password_hash: "hashed_pw", auth_provider: "google", display_name: "Jordan L.", karma_score: 98, is_anonymous: false, created_at: new Date(), updated_at: new Date() },
      { id: USER_IDS.sam, username: "samk", email: "sam@example.com", password_hash: "hashed_pw", auth_provider: "email", display_name: "Sam K.", karma_score: 67, is_anonymous: false, created_at: new Date(), updated_at: new Date() },
    ]);

    // ─── Support Circles ──────────────────────────────────────
    await queryInterface.bulkInsert("support_circles", [
      { id: CIRCLE_IDS.recover, creator_id: USER_IDS.alex, name: "Recover", description: "A safe space for those in recovery to share progress and setbacks.", visibility: "public", member_count: 815, created_at: new Date(), updated_at: new Date() },
      { id: CIRCLE_IDS.depression, creator_id: USER_IDS.jordan, name: "Depression", description: "Support and understanding for those experiencing depression.", visibility: "public", member_count: 503, created_at: new Date(), updated_at: new Date() },
      { id: CIRCLE_IDS.anxiety, creator_id: USER_IDS.sam, name: "Anxiety Warriors", description: "Coping strategies and mutual encouragement for anxiety.", visibility: "public", member_count: 672, created_at: new Date(), updated_at: new Date() },
      { id: CIRCLE_IDS.mindfulness, creator_id: USER_IDS.alex, name: "Mindfulness", description: "Meditation, breathing exercises, and being present.", visibility: "public", member_count: 340, created_at: new Date(), updated_at: new Date() },
    ]);

    // ─── Circle Memberships ───────────────────────────────────
    await queryInterface.bulkInsert("circle_memberships", [
      { id: uuid(), circle_id: CIRCLE_IDS.recover, user_id: USER_IDS.sarah, role: "member", joined_at: new Date(), created_at: new Date(), updated_at: new Date() },
      { id: uuid(), circle_id: CIRCLE_IDS.depression, user_id: USER_IDS.sarah, role: "member", joined_at: new Date(), created_at: new Date(), updated_at: new Date() },
      { id: uuid(), circle_id: CIRCLE_IDS.recover, user_id: USER_IDS.alex, role: "admin", joined_at: new Date(), created_at: new Date(), updated_at: new Date() },
      { id: uuid(), circle_id: CIRCLE_IDS.mindfulness, user_id: USER_IDS.alex, role: "admin", joined_at: new Date(), created_at: new Date(), updated_at: new Date() },
      { id: uuid(), circle_id: CIRCLE_IDS.depression, user_id: USER_IDS.jordan, role: "admin", joined_at: new Date(), created_at: new Date(), updated_at: new Date() },
      { id: uuid(), circle_id: CIRCLE_IDS.anxiety, user_id: USER_IDS.sam, role: "admin", joined_at: new Date(), created_at: new Date(), updated_at: new Date() },
      { id: uuid(), circle_id: CIRCLE_IDS.mindfulness, user_id: USER_IDS.sam, role: "member", joined_at: new Date(), created_at: new Date(), updated_at: new Date() },
    ]);

    // ─── Mood Check-Ins (Sarah's history) ─────────────────────
    const moods = [
      { value: 3, label: "okay", days_ago: 6 },
      { value: 4, label: "good", days_ago: 5 },
      { value: 2, label: "bad", days_ago: 4 },
      { value: 5, label: "great", days_ago: 3 },
      { value: 4, label: "good", days_ago: 2 },
      { value: 3, label: "okay", days_ago: 1 },
    ];
    await queryInterface.bulkInsert("mood_check_ins",
      moods.map((m) => {
        const d = new Date();
        d.setDate(d.getDate() - m.days_ago);
        return {
          id: uuid(), user_id: USER_IDS.sarah, mood_value: m.value,
          emoji_label: m.label, reflection: null, checked_in_at: d,
          created_at: d, updated_at: d,
        };
      })
    );

    // ─── Journal Entries (Sarah's entries from prototype) ──────
    await queryInterface.bulkInsert("journal_entries", [
      { id: uuid(), user_id: USER_IDS.sarah, title: null, body: "It was a pretty average day. I went to work and school... nothing too exciting.", visibility: "private", mood_value: 3, created_at: new Date(2026, 2, 20, 8, 41), updated_at: new Date(2026, 2, 20, 8, 41) },
      { id: uuid(), user_id: USER_IDS.sarah, title: null, body: "I passed all of my exams so far, I feel fantastic!!", visibility: "private", mood_value: 5, created_at: new Date(2026, 2, 22, 17, 53), updated_at: new Date(2026, 2, 22, 17, 53) },
      { id: uuid(), user_id: USER_IDS.sarah, title: null, body: "It rained all day. I got soaked.", visibility: "private", mood_value: 2, created_at: new Date(2026, 1, 15, 21, 20), updated_at: new Date(2026, 1, 15, 21, 20) },
      { id: uuid(), user_id: USER_IDS.sarah, title: null, body: "I have a presentation in the morning. I don't know if I'm ready and this has been stressing me out so much.", visibility: "private", mood_value: 1, created_at: new Date(2026, 1, 12, 4, 30), updated_at: new Date(2026, 1, 12, 4, 30) },
    ]);

    // ─── Messages ─────────────────────────────────────────────
    await queryInterface.bulkInsert("messages", [
      { id: uuid(), sender_id: USER_IDS.alex, recipient_id: USER_IDS.sarah, circle_id: null, content: "Hey! Saw your post about mindfulness. Really inspiring!", is_read: true, sent_at: new Date(), created_at: new Date(), updated_at: new Date() },
      { id: uuid(), sender_id: USER_IDS.sarah, recipient_id: USER_IDS.alex, circle_id: null, content: "Thanks Alex! It's been a journey.", is_read: true, sent_at: new Date(), created_at: new Date(), updated_at: new Date() },
      { id: uuid(), sender_id: USER_IDS.jordan, recipient_id: USER_IDS.sarah, circle_id: null, content: "Would you like to join our new circle?", is_read: false, sent_at: new Date(), created_at: new Date(), updated_at: new Date() },
    ]);

    // ─── Notifications ────────────────────────────────────────
    await queryInterface.bulkInsert("notifications", [
      { id: uuid(), user_id: USER_IDS.sarah, type: "circle_invite", content: "Jordan invited you to #SelfCare", reference_id: null, is_read: false, created_at: new Date(), updated_at: new Date() },
      { id: uuid(), user_id: USER_IDS.sarah, type: "new_message", content: "New message from Alex M.", reference_id: null, is_read: false, created_at: new Date(), updated_at: new Date() },
      { id: uuid(), user_id: USER_IDS.sarah, type: "karma_milestone", content: "You reached 48 karma points! 🎉", reference_id: null, is_read: true, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("notifications", null, {});
    await queryInterface.bulkDelete("messages", null, {});
    await queryInterface.bulkDelete("journal_entries", null, {});
    await queryInterface.bulkDelete("mood_check_ins", null, {});
    await queryInterface.bulkDelete("circle_memberships", null, {});
    await queryInterface.bulkDelete("support_circles", null, {});
    await queryInterface.bulkDelete("users", null, {});
  },
};
