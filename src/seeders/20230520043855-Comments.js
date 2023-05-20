'use strict';

/** @type {import('sequelize-cli').Migration} */
var now = new Date();
var hour = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0") + ":" + now.getSeconds().toString().padStart(2, "0");
var date = now.getFullYear().toString().padStart(4, "0") + "-" + (now.getMonth() + 1).toString().padStart(2, "0") + "-" + now.getDate().toString().padStart(2, "0");
var fullDate = date + " " + hour;
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('comments', [{
      post_id:"POS001",
      user_id:"USR002",
      comment:"Have you read this article about assigning variants? \n https://engineering.linkedin.com/blog/2020/a-b-testing-variant-assignment",
      created_at:fullDate
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('comments', null, {});
  }
};