// all libraries are already installed, we just need to use them.

// => All Library connection
const express = require("express")
const app = express()
const { QueryTypes, INTEGER } = require('sequelize');
const Joi = require('joi').extend(require('@joi/date'))
const jwt = require("jsonwebtoken");
const JWT_KEY = '.....';
// => End all library connection

// => Connection folder
const { connSql } = require("./sequelize");
const sequelize = connSql();

// => Endonnection folder

// => test connect
const conn = connSql();
const port = 3000;
const initApp = async () => {
    console.log("Testing database connection");
    try {
        await conn.authenticate();
        console.log("Successfully connected!");
        app.listen(port, () => console.log(`App listening on port ${port}!`));
    } catch (error) {
        console.error("Failure database connection : ", error.original);
    }
}
initApp();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// => End test connect
