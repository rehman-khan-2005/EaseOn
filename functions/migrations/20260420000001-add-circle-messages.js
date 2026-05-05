"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("circle_messages", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      circle_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "support_circles", key: "id" },
        onDelete: "CASCADE",
      },
      sender_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("circle_messages", ["circle_id", "created_at"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("circle_messages");
  },
};
