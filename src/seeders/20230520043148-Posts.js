'use strict';

/** @type {import('sequelize-cli').Migration} */
var now = new Date();
var hour = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0") + ":" + now.getSeconds().toString().padStart(2, "0");
var date = now.getFullYear().toString().padStart(4, "0") + "-" + (now.getMonth() + 1).toString().padStart(2, "0") + "-" + now.getDate().toString().padStart(2, "0");
var fullDate = date + " " + hour;
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('posts', [{
      post_id:"POS001",
      thread_id:"THR001",
      user_id:"USR001",
      post_name:"Different Algorithms for 50-50 A/B Testing",
      post_description:"We are running A/B tests on web app customers, given a customerId. Each customer will see different minor UX changes. Trying to prevent usage of Feature Flags as its not currently setup yet in our system.\n\n Initially we tried Even-Odd on CustomerId number, 50-50% ratio to test Feature 1. Example UserId 4 is even, 7 is odd. However, when testing another Feature 2, doing Even-Odd 50-50% would make , Feature 1 Groups to have a matching group with Feature 2, as they both share Same algorithm. \n\n What is another mathematical algorithm method, to run a hash or 50-50% algorithm , so I can differentiate? We will have probably 10 Features to test, so need a way to add a parameter in the FeatureFlag Algorithm, and will track in a Document Table.\n\n We are assigning groups with Javascript/Typescript btw.\n Note: Groups should be steady and not random , eg Even-odd will give a consistent result.",
      post_image:"",
      views:"0",
      likes:null,
      dislikes:null,
      created_at:fullDate
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('posts', null, {});
  }
};
