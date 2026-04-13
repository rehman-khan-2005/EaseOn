const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Post = sequelize.define(
    "Post",
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
      circle_tag: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "#General",
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      mood_value: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 5 },
      },
      visibility: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "public",
        validate: { isIn: [["public", "private"]] },
      },
      likes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "posts",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["user_id"] },
        { fields: ["circle_tag"] },
        { fields: ["created_at"] },
      ],
    }
  );

  return Post;
};
