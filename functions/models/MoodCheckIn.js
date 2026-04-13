const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MoodCheckIn = sequelize.define(
    "MoodCheckIn",
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
      mood_value: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      emoji_label: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          isIn: [["awful", "bad", "okay", "good", "great"]],
        },
      },
      reflection: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      checked_in_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "mood_check_ins",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["user_id"] },
        { fields: ["checked_in_at"] },
        { fields: ["user_id", "checked_in_at"] },
      ],
    }
  );

  return MoodCheckIn;
};
