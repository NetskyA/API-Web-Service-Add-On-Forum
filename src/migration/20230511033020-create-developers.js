'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('developers', {
      developer_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      username: {
        type: Sequelize.STRING,
        allowNull:false
      },
      email: {
        type: Sequelize.STRING,
        allowNull:false
      },
      password: {
        type: Sequelize.STRING,
        allowNull:false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull:false
      },
      saldo: {
        type: Sequelize.INTEGER,
        defaultValue:0
      },
      api_hit: {
        type: Sequelize.INTEGER,
        defaultValue:0
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue:0
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('developers');
  }
};