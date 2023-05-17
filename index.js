// all libraries are already installed, we just need to use them.

// => All Library connection
const express = require("express")
const app = express()
const { QueryTypes, INTEGER } = require('sequelize');
const Joi = require('joi').extend(require('@joi/date'))
const jwt = require("jsonwebtoken");
const JWT_KEY = '.....';
const fs = require("fs");
const multer = require("multer");
const uploadImage = multer({
    dest: "./uploads",
    fileFilter: function (req, file, cb) {
        if (file.mimetype != "image/png" && file.mimetype != "image/jpeg") {
            return cb(new Error("Wrong file type"), null);
        }
        cb(null, true);
    },
});
app.use("/uploads", express.static("uploads"))
// => End all library connection

// => Connection folder
const db = require("./src/models");
const developers = require("./src/models/developers");
const group_members = require("./src/models/group_members");

const port = 3000;
app.listen(port, function () {
    console.log(`listening on port ${port}`);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// => End test connect

// => All function
const cek_user = async (email) => {
    let cari = await db.Developers.findOne({ where: { email: email } })
    if (cari) {
        throw new Error("Email already been taken");
    }
    return email;
}
const cek_develop = async (group_id) => {
    let cari = await db.Groups.findOne({ where: { group_id: group_id } })
    if (!cari) {
        throw new Error("Group not found!");
    }
    return group_id;
}

const cek_groupname = async (group_name) => {
    let find = await db.Groups.findOne(
        {
            where: {
                group_id: group_id
            }
        }
    )
    if (find) {
        throw new Error("Group names cannot be same!");
    }
    return group_name;
}

// => End all function

//Developer =========================================
// DONE TINGGAL CEK ULANG (Nomer 1 bisa diganti yang uniq emailnya, username ga perlu uniq gpp, return bahasane sek onk seng indo ndek nomer 1), BIAYA API HIT TIAP ENDPOINT MASIH BELUM
//NO 1 (ALDI)
app.post("/api/developers/register", async (req, res) => {
    let { username, email, password, phone } = req.body;
    let hasUppercase = /[A-Z]/.test(password);
    let hasNumber = /\d/.test(password);
    let formatname = "DEV";
    let formatnumber = "(021)";
    const validateData = Joi.object({
        username: Joi.string().required().messages({ "string.empty": "something wrong Please check again", "any.required": "Please check value" }),
        email: Joi.string().email().required().external(cek_user).messages({ "string.empty": "check value", "any.required": "check value", "string.email": "Invalid email address" }),
        password: Joi.string().required().messages({ "string.empty": "check value", "any.required": "check value" }),
        phone: Joi.string().max(12).min(1).pattern(/^[0-9]+$/).messages({ "any.required": "check value", "string.empty": "check value", "string.pattern.base": "Invalid phone number", "string.max": "Invalid phone number", "string.min": "Invalid phone number" }),
    })
    try {
        await validateData.validateAsync(req.body)
    } catch (error) {
        return res.status(400).send(error.toString())
    }
    if (!password || password.length < 5) {
        return res.status(400).send("Passwords must have at least 5 characters");
    }
    if (!hasUppercase || !hasNumber) {
        return res.status(400).send("Password must contain capital letters and numbers");
    } else {
        result = await db.Developers.findAll();
        let id = formatname + (parseInt(result.length) + 1).toString().padStart(3, "0");
        let nohp = formatnumber + phone;
        await db.Developers.create({ developer_id: id, username: username, email: email, password: password, phone: nohp, })
        return res.status(201).send({ body: { "ID User": id, "Display name": username, Email: email, "No Handphone": nohp, "Saldo": 0, "Api Hit": 0 } })
    }
});

//NO 2 (ALDI)
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

//NO 3 (ALDI)
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

//NO 4 (ALDI)
app.post("/api/developers/recharge", async (req, res) => {
    let { api_hit } = req.body;
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
        api_hit: Joi.string().required().messages({ "string.empty": "Please input api hit", "any.required": "check value", }),
    })
    try {
        await validateData.validateAsync(req.body)
    } catch (error) {
        return res.status(400).send(error.toString())
    }
    const developer = await db.Developers.findByPk(validation_token.developer_id);

    if (api_hit * 5 > parseInt(developer.saldo)) {
        return res.status(400).send({ "msg": "Insufficient balance amount" })
    }
    let sum_api_hit = (parseInt(developer.api_hit)) + (parseInt(api_hit));
    let count_balance = (parseInt(developer.saldo)) - ((parseInt(api_hit) * 5));
    await db.Developers.update({ api_hit: sum_api_hit, saldo: count_balance }, { where: { developer_id: validation_token.developer_id } })
    return res.status(201).send({ "Total Api Hit": sum_api_hit, "Balance Count": count_balance });
});

//NO 5 (ALDI)
app.post("/api/developers/add/user", async (req, res) => {
    let { group_id, user_id } = req.body;
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
        group_id: Joi.string().required().external(cek_develop).messages({ "string.empty": "something wrong Please check again", "any.required": "Please check value" }),
        user_id: Joi.string().required().messages({ "string.empty": "Please input user id", "any.required": "check value", }),
    })
    try {
        await validateData.validateAsync(req.body)
    } catch (error) {
        return res.status(400).send(error.toString())
    }

    const cek_dev = await db.Groups.findOne({
        where: {
            group_id: group_id,
            developer_id: validation_token.developer_id
        }
    })

    if (!cek_dev) {
        return res.status(401).send({
            msg: "developers don't have access"
        })
    }

    const cekKembar = await db.Group_members.findOne({
        where: {
            group_id: group_id,
            user_id: user_id
        }
    })


    if (cekKembar) {
        return res.status(401).send({
            msg: "User id already registered!"
        })
    }
    await db.Group_members.create({ group_id: group_id, user_id: user_id },)
    return res.status(201).send({ msg: "User already join to group", "Group Id": group_id, "User Id": user_id });
});

// NO 6 (FIKO)
app.get("/api/developers/groupuser/:group_id", async function (req, res) {
    const { group_id } = req.params;
    let token = req.header('x-auth-token');
    if (!req.header('x-auth-token')) {
        return res.status(403).send({ "msg": "Authentication required" })
    }
    try {
        validation_token = jwt.verify(token, JWT_KEY)
    } catch (err) {
        return res.status(400).send({ "msg": "Invalid JWT Key" })
    }

    const cekGroupId = await db.Groups.findOne({
        where: {
            group_id: group_id
        }
    });
    if (!cekGroupId) {
        return res.status(404).send({
            msg: "Group_id not found!"
        })
    }

    const group = await db.Group_members.findAll({
        where: {
            group_id: group_id
        }
    })

    let members = [];
    for (let i = 0; i < group.length; i++) {
        const member = group[i];

        members.push(member.user_id);
    }

    return res.status(201).send({
        Group_id: group_id,
        Group_name: cekGroupId.group_name,
        members
    })
})

//Group =========================================
// DONE TINGGAL CEK ULANG + TAMBAIN THIRD PARTY API, BIAYA API HIT TIAP ENDPOINT MASIH BELUM
// NO 1 (FIKO)
app.post("/api/group", uploadImage.single("profile_picture"), async function (req, res) {
    let { group_name, group_description, user_id } = req.body;

    let token = req.header('x-auth-token');
    if (!req.header('x-auth-token')) {
        return res.status(403).send({ "msg": "Authentication required" })
    }
    try {
        validation_token = jwt.verify(token, JWT_KEY)
    } catch (err) {
        return res.status(400).send({ "msg": "Invalid JWT Key" })
    }

    if (!group_description) {
        group_description = "-"
    }
    let profile_picture = "-";

    if (!group_name) {
        return res.status(401).send({
            msg: "Group_name cannot be empty!"
        })
    }
    if (!user_id) {
        return res.status(401).send({
            msg: "User_id cannot be empty!"
        })
    }

    const groups = await db.Groups.findAll();
    let group_id;
    if (groups.length == 0) {
        group_id = "GRP" + (parseInt(groups.length) + 1).toString().padStart(3, "0");
    } else {
        group_id = "GRP" + (parseInt((groups[groups.length - 1].group_id).substring(3)) + 1).toString().padStart(3, "0");
    }

    var now = new Date();
    var hour = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0") + ":" + now.getSeconds().toString().padStart(2, "0");
    var date = now.getFullYear().toString().padStart(4, "0") + '-' + (now.getMonth() + 1).toString().padStart(2, "0") + '-' + now.getDate().toString().padStart(2, "0");
    var fullDate = date + ' ' + hour;

    if (req.file) {
        fs.renameSync(
            `./uploads/${req.file.filename}`,
            `./uploads/${group_id}.png`
        );
        profile_picture = `./uploads/${group_id}.png`;
    }

    const group = await db.Groups.create({
        group_id: group_id,
        developer_id: validation_token.developer_id,
        user_id: user_id,
        group_name: group_name,
        group_description: group_description,
        profile_picture: profile_picture,
        created_at: fullDate
    });

    const developer = await db.Developers.findByPk(validation_token.developer_id);

    return res.status(201).send({
        group_id: group_id,
        developer_name: developer.username,
        user_id: user_id,
        group_name: group_name,
        group_description: group_description,
        profile_picture: profile_picture,
        created_at: fullDate
    });
});

// NO 2 (FIKO)
app.put("/api/group/:group_id", uploadImage.single("profile_picture"), async function (req, res) {
    let { group_name, group_description, user_id } = req.body;
    let { group_id } = req.params;

    let token = req.header('x-auth-token');
    if (!req.header('x-auth-token')) {
        return res.status(403).send({ "msg": "Authentication required" })
    }
    try {
        validation_token = jwt.verify(token, JWT_KEY)
    } catch (err) {
        return res.status(400).send({ "msg": "Invalid JWT Key" })
    }

    if (!group_id) {
        return res.status(401).send({
            msg: "Group_id cannot be empty!"
        })
    }

    const cekGroup = await db.Groups.findByPk(group_id);
    if (!cekGroup) {
        return res.status(404).send({
            msg: "Group_id not found!"
        })
    }

    const cekGroupId = await db.Groups.findOne({
        where: {
            group_id: group_id,
            developer_id: validation_token.developer_id
        }
    })
    if (!cekGroupId) {
        return res.status(404).send({
            msg: "Developer cannot edit this group!"
        })
    }

    if (!group_name && !group_description && !req.file && !user_id) {
        return res.status(401).send({
            msg: "At least 1 field must be filled!"
        })
    }

    if (!group_description) {
        group_description = cekGroupId.group_description
    }

    if (!group_name) {
        group_name = cekGroupId.group_name
    }

    if (!user_id) {
        user_id = cekGroupId.user_id
    }

    let profile_picture = cekGroupId.profile_picture;

    if (req.file) {
        fs.unlinkSync(`./uploads/${group_id}.png`);
        fs.renameSync(
            `./uploads/${req.file.filename}`,
            `./uploads/${group_id}.png`
        );
        profile_picture = `./uploads/${group_id}.png`;
    }

    const group = await db.Groups.update({
        user_id: user_id,
        group_name: group_name,
        group_description: group_description,
        profile_picture: profile_picture,
    }, {
        where: {
            group_id: group_id
        }
    });

    const developer = await db.Developers.findByPk(validation_token.developer_id);

    return res.status(201).send({
        group_id: group_id,
        developer_name: developer.username,
        user_id: user_id,
        group_name: group_name,
        group_description: group_description,
        profile_picture: profile_picture,
        created_at: cekGroupId.created_at
    });
})

// NO 3 (FIKO)
app.delete("/api/group/:group_id", async function (req, res) {
    const { group_id } = req.params;

    let token = req.header('x-auth-token');
    if (!req.header('x-auth-token')) {
        return res.status(403).send({ "msg": "Authentication required" })
    }
    try {
        validation_token = jwt.verify(token, JWT_KEY)
    } catch (err) {
        return res.status(400).send({ "msg": "Invalid JWT Key" })
    }

    if (!group_id) {
        return res.status(401).send({
            msg: "Group_id cannot be empty!"
        })
    }

    const cekGroupId = await db.Groups.findByPk(group_id);

    if (!cekGroupId) {
        return res.status(404).send({
            msg: "Group_id not found!"
        })
    }

    const cekGroup = await db.Groups.findOne({
        where: {
            group_id: group_id,
            developer_id: validation_token.developer_id
        }
    })
    if (!cekGroup) {
        return res.status(404).send({
            msg: "Developer cannot edit this group!"
        })
    }

    await db.Groups.destroy({
        where: {
            group_id: group_id
        }
    })
    fs.unlinkSync(`./uploads/${group_id}.png`);
    return res.status(201).send({
        msg: `Success delete ${cekGroupId.group_name}`
    })
})

// NO 4 (FIKO)
app.get("/api/group/:group_id", async function (req, res) {
    let { group_id } = req.params;

    let token = req.header('x-auth-token');
    if (!req.header('x-auth-token')) {
        return res.status(403).send({ "msg": "Authentication required" })
    }
    try {
        validation_token = jwt.verify(token, JWT_KEY)
    } catch (err) {
        return res.status(400).send({ "msg": "Invalid JWT Key" })
    }

    if (!group_id) {
        return res.status(401).send({
            msg: "Group_id cannot be empty!"
        })
    }

    const cekGroupId = await db.Groups.findByPk(group_id);
    if (!cekGroupId) {
        return res.status(404).send({
            msg: "Group_id not found!"
        })
    }

    const developer = await db.Developers.findByPk(validation_token.developer_id);

    return res.status(201).send({
        group_id: group_id,
        developer_name: developer.username,
        user_id: cekGroupId.user_id,
        group_name: cekGroupId.group_name,
        group_description: cekGroupId.group_description,
        profile_picture: cekGroupId.profile_picture,
        created_at: cekGroupId.created_at
    });
})

//Thread =========================================
// MASIH BELUM


//Post =========================================
// MASIH BELUM

//Comment =========================================
// MASIH BELUM
