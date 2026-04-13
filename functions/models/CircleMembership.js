const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CircleMembership = sequelize.define(
    "CircleMembership",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      circle_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "support_circles", key: "id" },
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "member",
        validate: {
          isIn: [["admin", "moderator", "member"]],
        },
      },
      joined_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "circle_memberships",
      timestamps: true,
      underscored: true,
      indexes: [
        { unique: true, fields: ["circle_id", "user_id"] },
        { fields: ["user_id"] },
        { fields: ["circle_id"] },
      ],
    }
  );

  return CircleMembership;
};
