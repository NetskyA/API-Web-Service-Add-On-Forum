'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('developers', [{
      developer_id:"DEV001",
      username:"Christopher Conner",
      email:"christopher@gmail.com",
      password:"12345Cc",
      phone:"08126336627",
      saldo:0,
      api_hit:0,
      status:0
    }]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('developers', null, {});
  }
};
