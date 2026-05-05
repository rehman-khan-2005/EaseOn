const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CircleMessage = sequelize.define(
    "CircleMessage",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      circle_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      sender_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "circle_messages",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      underscored: true,
    }
  );
  return CircleMessage;
};
