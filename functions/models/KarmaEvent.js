const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const KarmaEvent = sequelize.define(
    "KarmaEvent",
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
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: "karma_events",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      underscored: true,
      indexes: [{ fields: ["user_id", "created_at"] }],
    }
  );
  return KarmaEvent;
};
