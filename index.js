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
const db = require("./src/models");
const developers = require("./src/models/developers");

const port = 3000;
app.listen(port, function () {
    console.log(`listening on port ${port}`);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// => End test connect

// => All function
const cek_user = async (username) => {
    let cari = await db.Developers.findOne({ where: { username: username } })
    if (cari) {
        throw new Error("username already been taken");
    }
    return username;
}

// => End all function

//Developer =========================================
//No 1
app.post("/api/developers/register", async (req, res) => {
    let { username, email, password, phone } = req.body;
    let hasUppercase = /[A-Z]/.test(password);
    let hasNumber = /\d/.test(password);
    let formatname = "DEV";
    let formatnumber = "(021)";
    const validateData = Joi.object({
        username: Joi.string().required().external(cek_user).messages({ "string.empty": "something wrong Please check again", "any.required": "Please check value" }),
        email: Joi.string().email().required().messages({ "string.empty": "check value", "any.required": "check value", "string.email": "Invalid email address" }),
        password: Joi.string().required().messages({ "string.empty": "check value", "any.required": "check value" }),
        phone: Joi.string().max(12).min(1).pattern(/^[0-9]+$/).messages({ "any.required": "check value", "string.empty": "check value", "string.pattern.base": "Invalid phone number", "string.max": "Invalid phone number", "string.min": "Invalid phone number" }),
    })
    try {
        await validateData.validateAsync(req.body)
    } catch (error) {
        return res.status(400).send(error.toString())
    }
    if (!password || password.length < 5) {
        return res.status(400).send("Password harus memiliki minimal 5 karakter");
    }
    if (!hasUppercase || !hasNumber) {
        return res.status(400).send("Password harus mengandung huruf kapital dan angka");
    } else {
        result = await db.Developers.findAll();
        let id = formatname + (parseInt(result.length) + 1).toString().padStart(3, "0");
        let nohp = formatnumber + phone;
        await db.Developers.create({ developer_id: id, username: username, email: email, password: password, phone: nohp, })
        return res.status(201).send({ body: { "ID User": id, "Display name": username, Email: email, "No Handphone": nohp, "Saldo": 0, "Api Hit": 0 } })
    }
});

//NO 2
app.post("/api/developers/login", async (req, res) => {
    let { email, password } = req.body;
    const validateData = Joi.object({
        email: Joi.string().email().required().messages({ "string.empty": "Please input email", "any.required": "check value", "string.email": "Please input email" }),
        password: Joi.string().required().messages({ "string.empty": "check value password", "any.required": "check value" }),
    })
    try {
        await validateData.validateAsync(req.body)
    } catch (error) {
        return res.status(400).send(error.toString())
    }

    const cekEmailDeveloper = await db.Developers.findOne({
        where: {
            email: email,
        }
    })
    if (!cekEmailDeveloper) {
        return res.status(404).send({
            msg: "Email not found!"
        })
    }

    const developer = await db.Developers.findOne({
        where: {
            email: email,
            password: password
        }
    })

    if (!developer) {
        return res.status(404).send({
            msg: "Wrong password!"
        })
    }

    // let developer_id = developers;
    // return res.status(200).send(developer.developer_id)

    let token = jwt.sign({ developer_id: developer.developer_id }, JWT_KEY)
    return res.status(200).send({ "Developer": email, "Token Activ": token })

});

//NO 3
app.post("/api/developers/topup", async (req, res) => {
    let { saldo } = req.body;
    let token = req.header('x-auth-token');
    if (!req.header('x-auth-token')) {
        return res.status(403).send({ "msg": "Authentication required" })
    }
    try {
        validation_token = jwt.verify(token, JWT_KEY)
    } catch (err) {
        return res.status(400).send({ "msg": "Invalid JWT Key" })
    }

    const validateData = Joi.object({
        saldo: Joi.string().required().messages({ "string.empty": "Please input saldo", "any.required": "check value", }),
    })
    try {
        await validateData.validateAsync(req.body)
    } catch (error) {
        return res.status(400).send(error.toString())
    }

    if (parseInt(saldo) < 1) {
        return res.status(404).send({ msg: "Minimal " })
    }
    const developer = await db.Developers.findByPk(validation_token.developer_id);
    let sum_saldo = (parseInt(developer.saldo)) + (parseInt(saldo));
    await db.Developers.update({ saldo: sum_saldo }, { where: { developer_id: validation_token.developer_id } })

    return res.status(201).send({ "Saldo": sum_saldo })
});