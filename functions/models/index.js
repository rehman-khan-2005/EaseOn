const { Sequelize } = require("sequelize");
const config = require("../config/database");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
}

const User = require("./User")(sequelize);
const MoodCheckIn = require("./MoodCheckIn")(sequelize);
const JournalEntry = require("./JournalEntry")(sequelize);
const SupportCircle = require("./SupportCircle")(sequelize);
const CircleMembership = require("./CircleMembership")(sequelize);
const Message = require("./Message")(sequelize);
const Notification = require("./Notification")(sequelize);
const Post = require("./Post")(sequelize);
const Comment = require("./Comment")(sequelize);
const KarmaEvent = require("./KarmaEvent")(sequelize);
const CircleMessage = require("./CircleMessage")(sequelize);

User.hasMany(MoodCheckIn, { foreignKey: "user_id", as: "moodCheckIns" });
MoodCheckIn.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(JournalEntry, { foreignKey: "user_id", as: "journalEntries" });
JournalEntry.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(SupportCircle, { foreignKey: "creator_id", as: "createdCircles" });
SupportCircle.belongsTo(User, { foreignKey: "creator_id", as: "creator" });
User.belongsToMany(SupportCircle, { through: CircleMembership, foreignKey: "user_id", otherKey: "circle_id", as: "joinedCircles" });
SupportCircle.belongsToMany(User, { through: CircleMembership, foreignKey: "circle_id", otherKey: "user_id", as: "members" });
User.hasMany(CircleMembership, { foreignKey: "user_id", as: "memberships" });
CircleMembership.belongsTo(User, { foreignKey: "user_id", as: "user" });
SupportCircle.hasMany(CircleMembership, { foreignKey: "circle_id", as: "memberships" });
CircleMembership.belongsTo(SupportCircle, { foreignKey: "circle_id", as: "circle" });
User.hasMany(Message, { foreignKey: "sender_id", as: "sentMessages" });
User.hasMany(Message, { foreignKey: "recipient_id", as: "receivedMessages" });
Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" });
Message.belongsTo(User, { foreignKey: "recipient_id", as: "recipient" });
User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Post, { foreignKey: "user_id", as: "posts" });
Post.belongsTo(User, { foreignKey: "user_id", as: "user" });
Post.hasMany(Comment, { foreignKey: "post_id", as: "comments" });
Comment.belongsTo(Post, { foreignKey: "post_id", as: "post" });
User.hasMany(Comment, { foreignKey: "user_id", as: "comments" });
Comment.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(KarmaEvent, { foreignKey: "user_id", as: "karmaEvents" });
KarmaEvent.belongsTo(User, { foreignKey: "user_id", as: "user" });
CircleMessage.belongsTo(User, { foreignKey: "sender_id", as: "sender" });
SupportCircle.hasMany(CircleMessage, { foreignKey: "circle_id" });
CircleMessage.belongsTo(SupportCircle, { foreignKey: "circle_id" });

module.exports = { sequelize, Sequelize, User, MoodCheckIn, JournalEntry, SupportCircle, CircleMembership, Message, Notification, Post, Comment, KarmaEvent, CircleMessage };
