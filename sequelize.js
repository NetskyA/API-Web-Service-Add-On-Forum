const Sequelize = require("sequelize");
const db = new Sequelize("proyek_ws", "root", "",
  { host: "localhost", dialect: "mysql", logging: false });

module.exports = {
  initDB: () => {
    return db.authenticate();
  },
  connSql: () => {
    return db;
  },
};


