'use strict';

/** @type {import('sequelize-cli').Migration} */

var now = new Date();
var hour = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0") + ":" + now.getSeconds().toString().padStart(2, "0");
var date = now.getFullYear().toString().padStart(4, "0") + "-" + (now.getMonth() + 1).toString().padStart(2, "0") + "-" + now.getDate().toString().padStart(2, "0");
var fullDate = date + " " + hour;
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('threads', [{
      thread_id:"THR001",
      group_id:"GRP001",
      user_id:"USR001",
      thread_name:"Questions",
      thread_description:"Put your question here!",
      created_at:fullDate
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('threads', null, {});
  }
};
