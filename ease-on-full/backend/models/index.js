const { Sequelize } = require("sequelize");
const config = require("../config/database");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

// ─── Create Sequelize Instance ──────────────────────────────────────
let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
  );
}

// ─── Import Models ──────────────────────────────────────────────────
const User = require("./User")(sequelize);
const MoodCheckIn = require("./MoodCheckIn")(sequelize);
const JournalEntry = require("./JournalEntry")(sequelize);
const SupportCircle = require("./SupportCircle")(sequelize);
const CircleMembership = require("./CircleMembership")(sequelize);
const Message = require("./Message")(sequelize);
const Notification = require("./Notification")(sequelize);

// ─── Define Associations (matching ER Diagram from proposal) ────────

// Users → MoodCheckIns: one-to-many
User.hasMany(MoodCheckIn, { foreignKey: "user_id", as: "moodCheckIns" });
MoodCheckIn.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Users → JournalEntries: one-to-many
User.hasMany(JournalEntry, { foreignKey: "user_id", as: "journalEntries" });
JournalEntry.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Users → SupportCircles: one-to-many via creator_id
User.hasMany(SupportCircle, { foreignKey: "creator_id", as: "createdCircles" });
SupportCircle.belongsTo(User, { foreignKey: "creator_id", as: "creator" });

// Users ↔ SupportCircles via CircleMemberships: many-to-many
User.belongsToMany(SupportCircle, {
  through: CircleMembership,
  foreignKey: "user_id",
  otherKey: "circle_id",
  as: "joinedCircles",
});
SupportCircle.belongsToMany(User, {
  through: CircleMembership,
  foreignKey: "circle_id",
  otherKey: "user_id",
  as: "members",
});

// Direct access to junction table
User.hasMany(CircleMembership, { foreignKey: "user_id", as: "memberships" });
CircleMembership.belongsTo(User, { foreignKey: "user_id", as: "user" });
SupportCircle.hasMany(CircleMembership, { foreignKey: "circle_id", as: "memberships" });
CircleMembership.belongsTo(SupportCircle, { foreignKey: "circle_id", as: "circle" });

// Users → Messages: one-to-many (sender and recipient)
User.hasMany(Message, { foreignKey: "sender_id", as: "sentMessages" });
User.hasMany(Message, { foreignKey: "recipient_id", as: "receivedMessages" });
Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" });
Message.belongsTo(User, { foreignKey: "recipient_id", as: "recipient" });

// Users → Notifications: one-to-many
User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });

// ─── Export ─────────────────────────────────────────────────────────
const db = {
  sequelize,
  Sequelize,
  User,
  MoodCheckIn,
  JournalEntry,
  SupportCircle,
  CircleMembership,
  Message,
  Notification,
};

module.exports = db;
