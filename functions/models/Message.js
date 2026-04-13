const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Message = sequelize.define(
    "Message",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sender_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      recipient_id: {
        type: DataTypes.UUID,
        allowNull: true, // null = group message
        references: { model: "users", key: "id" },
      },
      circle_id: {
        type: DataTypes.UUID,
        allowNull: true, // non-null = group/circle message
        references: { model: "support_circles", key: "id" },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "messages",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["sender_id"] },
        { fields: ["recipient_id"] },
        { fields: ["circle_id"] },
        { fields: ["sender_id", "recipient_id"] },
        { fields: ["sent_at"] },
      ],
    }
  );

  return Message;
};
