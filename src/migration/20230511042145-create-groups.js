'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('groups', {
      group_id: {
        type: Sequelize.STRING,
        primaryKey:true,
        allowNull:false
      },
      developer_id: {
        type: Sequelize.STRING,
        allowNull:false
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull:false
      },
      group_name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      group_description: {
        type: Sequelize.TEXT,
        allowNull:false
      },
      profile_picture: {
        type: Sequelize.TEXT,
        allowNull:false
      },
      created_at: {
        type: Sequelize.STRING,
        allowNull:false
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('groups');
  }
};