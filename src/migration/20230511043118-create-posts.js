'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      post_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      thread_id: {
        type: Sequelize.STRING,
        allowNull:false
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull:false
      },
      post_name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      post_description: {
        type: Sequelize.TEXT,
        allowNull:false
      },
      post_image: {
        type: Sequelize.TEXT,
        allowNull:false
      },
      views: {
        type: Sequelize.INTEGER,
        defaultValue:0
      },
      likes: {
        type: Sequelize.JSON,
        allowNull:true
      },
      dislikes: {
        type: Sequelize.JSON,
        allowNull:true
      },
      created_at: {
        type: Sequelize.STRING,
        allowNull:false
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('posts');
  }
};