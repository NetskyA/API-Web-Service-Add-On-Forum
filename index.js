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
const db = require("./src/models")

const port = 3000;
app.listen(port, function () {
    console.log(`listening on port ${port}`);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// => End test connect

// => All function


// => End all function