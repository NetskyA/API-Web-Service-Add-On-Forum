'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('threads', {
      thread_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      group_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      thread_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      thread_description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      created_at: {
        type: Sequelize.STRING,
        allowNull: false
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('threads');
  }
};