'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('group_members', [{
      group_id:"GRP001",
      user_id:"USR001",
    },{
      group_id:"GRP001",
      user_id:"USR002",
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('group_members', null, {});
  }
};
