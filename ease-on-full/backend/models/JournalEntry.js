const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const JournalEntry = sequelize.define(
    "JournalEntry",
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
      title: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      visibility: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "private",
        validate: {
          isIn: [["private", "circle", "public"]],
        },
      },
      mood_value: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 5 },
      },
    },
    {
      tableName: "journal_entries",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["user_id"] },
        { fields: ["visibility"] },
        { fields: ["created_at"] },
      ],
    }
  );

  return JournalEntry;
};
