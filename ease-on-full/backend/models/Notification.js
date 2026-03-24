const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      type: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          isIn: [["circle_invite", "new_message", "karma_milestone", "mood_reminder", "circle_post", "system"]],
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      reference_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "notifications",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["user_id"] },
        { fields: ["user_id", "is_read"] },
        { fields: ["type"] },
      ],
    }
  );

  return Notification;
};
