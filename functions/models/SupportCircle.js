const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SupportCircle = sequelize.define(
    "SupportCircle",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      creator_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      visibility: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "public",
        validate: {
          isIn: [["public", "private", "invite_only"]],
        },
      },
      member_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      tableName: "support_circles",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["creator_id"] },
        { fields: ["visibility"] },
        { fields: ["name"] },
      ],
    }
  );

  return SupportCircle;
};
