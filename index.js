// all libraries are already installed, we just need to use them.

// BUAT BAYAR API HIT.
// const temp = await bayar_api_hit("DEVELOPER_ID", 1);
// if(temp==false){
// 	return res.status(401).send({ messages: "Api hit is not enough!"})
// }

// => All Library connection
const express = require("express");
const app = express();
const { QueryTypes, INTEGER, Op } = require("sequelize");
const Joi = require("joi").extend(require("@joi/date"));
const jwt = require("jsonwebtoken");
const JWT_KEY = ".....";
const fs = require("fs");
const axios = require("axios");
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
const uploadFile = multer({
	dest: "./uploads",
});
app.use("/uploads", express.static("uploads"));
// => End all library connection

// => Connection folder
const db = require("./src/models");
const developers = require("./src/models/developers");
const group_members = require("./src/models/group_members");
const { group } = require("console");

const port = 3000;
app.listen(port, function () {
	console.log(`listening on port ${port}`);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// => End test connect

// => All function
const cek_add_user = async (username) => {
	let cari = await db.Developers.findOne({ where: { username: username } });
	if (cari) {
		throw new Error("Username already been taken");
	}
	return username;
};
const cek_user_email = async (email) => {
	let cari = await db.Developers.findOne({ where: { email: email } });
	if (cari) {
		throw new Error("Email already been taken");
	}
	return email;
};
const cek_develop = async (group_id) => {
	let cari = await db.Groups.findOne({ where: { group_id: group_id } });
	if (!cari) {
		throw new Error("Group not found!");
	}
	return group_id;
};

const cek_groupname = async (group_name) => {
	let find = await db.Groups.findOne({
		where: {
			group_id: group_id,
		},
	});
	if (find) {
		throw new Error("Group names cannot be same!");
	}
	return group_name;
};

function cekToken(req, res, next) {
	const token = req.headers["x-auth-token"];
	if (!token) {
		return res.status(403).send("Unauthorized");
	}

	try {
		const user = jwt.verify(token, JWT_KEY);
		req.user = user;
		next();
	} catch (error) {
		console.log(error);
		return res.status(400).send(error);
	}
}

async function generateThreadID() {
	let tempID = "THR";

	// Find Last ID
	let threads = await db.Threads.findAll({
		where: {
			thread_id: {
				[Op.like]: "%" + tempID + "%",
			},
		},
	});

	let lastID;
	if (threads.length > 0) {
		threads.forEach((thread) => {
			let thread_id = thread.thread_id;
			lastID = thread_id.substring(3);
		});
	} else {
		lastID = "000";
	}
	lastID++;

	let newID = tempID + lastID.toString().padStart(3, "0");

	return newID;
}

async function bayar_api_hit(developer_id, api_hit) {
	const tempDev = await db.Developers.findByPk(developer_id);
	let temp_api_hit = parseInt(tempDev.api_hit) - parseInt(api_hit);

	if (temp_api_hit < 0) {
		return false;
	} else {
		await db.Developers.update({
			api_hit: temp_api_hit
		}, {
			where: {
				developer_id: developer_id
			}
		})
		return true;
	}
}

async function translateText(text) {
	const encodedParams = new URLSearchParams();
	encodedParams.set('source_language', 'id');
	encodedParams.set('target_language', 'en');
	encodedParams.set('text', text);

	const options = {
		method: 'POST',
		url: 'https://text-translator2.p.rapidapi.com/translate',
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			'X-RapidAPI-Key': '87f8e9a2bamsh3270a0e04c5ba53p19a277jsn222df5ba883c',
			'X-RapidAPI-Host': 'text-translator2.p.rapidapi.com'
		},
		data: encodedParams,
	};

	const name = await axios.request(options);
	return name.data.data.translatedText;
}

async function profanityChecker(text) {
	const options = {
		method: 'POST',
		url: 'https://cyber-guardian.p.rapidapi.com/detections_r',
		headers: {
			'content-type': 'application/json',
			'X-RapidAPI-Key': '87f8e9a2bamsh3270a0e04c5ba53p19a277jsn222df5ba883c',
			'X-RapidAPI-Host': 'cyber-guardian.p.rapidapi.com'
		},
		data: {
			message: {
				msg_body: text,
				author_id: '419130737149739008',
				msg_id: '990922957016694798',
				channel_id: '928990565536784497',
				application_id: 'default',
				timestamp: 1656317643,
				language: 'en',
				author_is_bot: false,
				msg_type: 'PUBLIC_MESSAGE'
			},
			application_custom_data: {}
		}
	};
	const response = await axios.request(options);
	if (response.data.data.detection_details.resulting_categories.length === 0) return false
	return true;
}
// => End all function

//Developer =========================================

//NO 1 (ALDI)
app.post("/api/developers/register", async (req, res) => {
	let { username, email, password, phone } = req.body;
	let hasUppercase = /[A-Z]/.test(password);
	let hasNumber = /\d/.test(password);
	let formatname = "DEV";
	let formatnumber = "(021)";
	const validateData = Joi.object({
		username: Joi.string().required().external(cek_add_user).messages({ "string.empty": "something wrong Please check again", "any.required": "Please check value" }),
		email: Joi.string().email().required().external(cek_user_email).messages({ "string.empty": "something wrong Please check again", "any.required": "check value", "string.email": "Invalid email address" }),
		password: Joi.string().required().messages({ "string.empty": "something wrong Please check again", "any.required": "check value" }),
		phone: Joi.string()
			.max(12)
			.min(1)
			.pattern(/^[0-9]+$/)
			.messages({ "any.required": "check value", "string.empty": "check value", "string.pattern.base": "Invalid phone number", "string.max": "Invalid phone number", "string.min": "Invalid phone number" }),
	});
	try {
		await validateData.validateAsync(req.body);
	} catch (error) {
		return res.status(400).send(error.toString());
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
		await db.Developers.create({ developer_id: id, username: username, email: email, password: password, phone: nohp });
		return res.status(201).send({ body: { "ID User": id, "Display name": username, Email: email, "No Handphone": nohp, Saldo: 0, "Api Hit": 0 } });
	}
});

//NO 2 (ALDI)
app.post("/api/developers/login", async (req, res) => {
	let { email, password } = req.body;
	const validateData = Joi.object({
		email: Joi.string().email().required().messages({ "string.empty": "Please input email", "any.required": "check value", "string.email": "Please input email" }),
		password: Joi.string().required().messages({ "string.empty": "check value password", "any.required": "check value" }),
	});
	try {
		await validateData.validateAsync(req.body);
	} catch (error) {
		return res.status(400).send(error.toString());
	}

	const cekEmailDeveloper = await db.Developers.findOne({
		where: {
			email: email,
		},
	});
	if (!cekEmailDeveloper) {
		return res.status(404).send({
			message: "Email not found!",
		});
	}

	const developer = await db.Developers.findOne({
		where: {
			email: email,
			password: password,
		},
	});

	if (!developer) {
		return res.status(404).send({
			message: "Wrong password!",
		});
	}

	// let developer_id = developers;
	// return res.status(200).send(developer.developer_id)

	let token = jwt.sign({ developer_id: developer.developer_id }, JWT_KEY);
	return res.status(200).send({ Developer: email, "Token Activ": token });
});

//NO 3 (ALDI)
app.post("/api/developers/topup", async (req, res) => {
	let { saldo } = req.body;
	let token = req.header("x-auth-token");
	if (!req.header("x-auth-token")) {
		return res.status(403).send({ message: "Authentication required" });
	}
	try {
		validation_token = jwt.verify(token, JWT_KEY);
	} catch (err) {
		return res.status(400).send({ message: "Invalid JWT Key" });
	}

	const validateData = Joi.object({
		saldo: Joi.string().required().messages({ "string.empty": "Please input saldo", "any.required": "check value" }),
	});
	try {
		await validateData.validateAsync(req.body);
	} catch (error) {
		return res.status(400).send(error.toString());
	}

	if (parseInt(saldo) < 1) {
		return res.status(404).send({ message: "Invalid value minimum 1" });
	}
	const developer = await db.Developers.findByPk(validation_token.developer_id);
	let sum_saldo = parseInt(developer.saldo) + parseInt(saldo);
	await db.Developers.update({ saldo: sum_saldo }, { where: { developer_id: validation_token.developer_id } });
	return res.status(201).send({ Saldo: sum_saldo });
});

//NO 4 (ALDI)
app.post("/api/developers/recharge", async (req, res) => {
	let { api_hit } = req.body;
	let token = req.header("x-auth-token");
	if (!req.header("x-auth-token")) {
		return res.status(403).send({ message: "Authentication required" });
	}
	try {
		validation_token = jwt.verify(token, JWT_KEY);
	} catch (err) {
		return res.status(400).send({ message: "Invalid JWT Key" });
	}
	const validateData = Joi.object({
		api_hit: Joi.string().required().messages({ "string.empty": "Please input api hit", "any.required": "check value" }),
	});
	try {
		await validateData.validateAsync(req.body);
	} catch (error) {
		return res.status(400).send(error.toString());
	}
	const developer = await db.Developers.findByPk(validation_token.developer_id);

	if (api_hit * 5 > parseInt(developer.saldo)) {
		return res.status(400).send({ message: "Insufficient balance amount" });
	}
	if (parseInt(api_hit) < 1) {
		return res.status(404).send({ message: "Invalid value minimum 1" });
	}
	let sum_api_hit = parseInt(developer.api_hit) + parseInt(api_hit);
	let count_balance = parseInt(developer.saldo) - parseInt(api_hit) * 5;
	await db.Developers.update({ api_hit: sum_api_hit, saldo: count_balance }, { where: { developer_id: validation_token.developer_id } });
	return res.status(201).send({ "Total Api Hit": sum_api_hit, "Balance Count": count_balance });
});

//NO 5 (ALDI)
app.post("/api/developers/add/user", async (req, res) => {
	let { group_id, user_id } = req.body;
	let token = req.header("x-auth-token");
	if (!req.header("x-auth-token")) {
		return res.status(403).send({ message: "Authentication required" });
	}
	try {
		validation_token = jwt.verify(token, JWT_KEY);
	} catch (err) {
		return res.status(400).send({ message: "Invalid JWT Key" });
	}
	const validateData = Joi.object({
		group_id: Joi.string().required().external(cek_develop).messages({ "string.empty": "something wrong Please check again", "any.required": "Please check value" }),
		user_id: Joi.string().required().messages({ "string.empty": "Please input user id", "any.required": "check value" }),
	});
	try {
		await validateData.validateAsync(req.body);
	} catch (error) {
		return res.status(400).send(error.toString());
	}

	const cek_dev = await db.Groups.findOne({
		where: {
			group_id: group_id,
			developer_id: validation_token.developer_id,
		},
	});

	if (!cek_dev) {
		return res.status(401).send({
			message: "developers don't have access",
		});
	}

	const cekKembar = await db.Group_members.findOne({
		where: {
			group_id: group_id,
			user_id: user_id,
		},
	});

	if (cekKembar) {
		return res.status(401).send({
			message: "User id already registered!",
		});
	}
	//API HIT 2
	const temp = await bayar_api_hit(validation_token.developer_id, 2);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	await db.Group_members.create({ group_id: group_id, user_id: user_id });
	return res.status(201).send({ message: "User joined the group", "Group Id": group_id, "User Id": user_id });
});

// NO 6 (FIKO)
app.get("/api/developers/groupuser/:group_id", async function (req, res) {
	const { group_id } = req.params;
	let token = req.header("x-auth-token");
	if (!req.header("x-auth-token")) {
		return res.status(403).send({ message: "Authentication required" });
	}
	try {
		validation_token = jwt.verify(token, JWT_KEY);
	} catch (err) {
		return res.status(400).send({ message: "Invalid JWT Key" });
	}

	const cekGroupId = await db.Groups.findOne({
		where: {
			group_id: group_id,
		},
	});
	if (!cekGroupId) {
		return res.status(404).send({
			message: "Group_id not found!",
		});
	}

	const group = await db.Group_members.findAll({
		where: {
			group_id: group_id,
		},
	});

	let members = [];
	for (let i = 0; i < group.length; i++) {
		const member = group[i];

		members.push(member.user_id);
	}
	//API HIT 2
	const temp = await bayar_api_hit(validation_token.developer_id, 2);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	return res.status(201).send({
		Group_id: group_id,
		Group_name: cekGroupId.group_name,
		members,
	});
});

//Group =========================================
// NO 1 (FIKO)
app.post("/api/group", uploadImage.single("profile_picture"), async function (req, res) {
	let { group_name, group_description, user_id } = req.body;

	let token = req.header("x-auth-token");
	if (!req.header("x-auth-token")) {
		return res.status(403).send({ message: "Authentication required" });
	}
	try {
		validation_token = jwt.verify(token, JWT_KEY);
	} catch (err) {
		return res.status(400).send({ message: "Invalid JWT Key" });
	}

	if (!group_description) {
		group_description = "-";
	}
	let profile_picture = "-";

	if (!group_name) {
		return res.status(401).send({
			message: "Group_name cannot be empty!",
		});
	}
	if (!user_id) {
		return res.status(401).send({
			message: "User_id cannot be empty!",
		});
	}

	if (await profanityChecker(await translateText(group_name)) === true) return res.status(401).send({ message: "Group_name contains offensive word" });
	if (await profanityChecker(await translateText(group_description)) === true) return res.status(401).send({ message: "Group_description contains offensive word" });

	const groups = await db.Groups.findAll();
	let group_id;
	if (groups.length == 0) {
		group_id = "GRP" + (parseInt(groups.length) + 1).toString().padStart(3, "0");
	} else {
		group_id = "GRP" + (parseInt(groups[groups.length - 1].group_id.substring(3)) + 1).toString().padStart(3, "0");
	}

	var now = new Date();
	var hour = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0") + ":" + now.getSeconds().toString().padStart(2, "0");
	var date = now.getFullYear().toString().padStart(4, "0") + "-" + (now.getMonth() + 1).toString().padStart(2, "0") + "-" + now.getDate().toString().padStart(2, "0");
	var fullDate = date + " " + hour;

	if (req.file) {
		fs.renameSync(`./uploads/${req.file.filename}`, `./uploads/${group_id}.png`);
		profile_picture = `./uploads/${group_id}.png`;
	}
	//API HIT 5
	const temp = await bayar_api_hit(validation_token.developer_id, 5);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	const group = await db.Groups.create({
		group_id: group_id,
		developer_id: validation_token.developer_id,
		user_id: user_id,
		group_name: group_name,
		group_description: group_description,
		profile_picture: profile_picture,
		created_at: fullDate,
	});

	const developer = await db.Developers.findByPk(validation_token.developer_id);

	return res.status(201).send({
		group_id: group_id,
		developer_name: developer.username,
		user_id: user_id,
		group_name: group_name,
		group_description: group_description,
		profile_picture: profile_picture,
		created_at: fullDate,
	});
});

// NO 2 (FIKO)
app.put("/api/group/:group_id", uploadImage.single("profile_picture"), async function (req, res) {
	let { group_name, group_description, user_id } = req.body;
	let { group_id } = req.params;

	let token = req.header("x-auth-token");
	if (!req.header("x-auth-token")) {
		return res.status(403).send({ message: "Authentication required" });
	}
	try {
		validation_token = jwt.verify(token, JWT_KEY);
	} catch (err) {
		return res.status(400).send({ message: "Invalid JWT Key" });
	}

	if (!group_id) {
		return res.status(401).send({
			message: "Group_id cannot be empty!",
		});
	}

	const cekGroup = await db.Groups.findByPk(group_id);
	if (!cekGroup) {
		return res.status(404).send({
			message: "Group_id not found!",
		});
	}

	const cekGroupId = await db.Groups.findOne({
		where: {
			group_id: group_id,
			developer_id: validation_token.developer_id,
		},
	});
	if (!cekGroupId) {
		return res.status(404).send({
			message: "Developer cannot edit this group!",
		});
	}

	if (!group_name && !group_description && !req.file && !user_id) {
		return res.status(401).send({
			message: "At least 1 field must be filled!",
		});
	}

	if (!group_description) {
		group_description = cekGroupId.group_description;
	}

	if (!group_name) {
		group_name = cekGroupId.group_name;
	}

	if (!user_id) {
		user_id = cekGroupId.user_id;
	}

	if (await profanityChecker(await translateText(group_name)) === true) return res.status(401).send({ message: "Group_name contains offensive word" });
	if (await profanityChecker(await translateText(group_description)) === true) return res.status(401).send({ message: "Group_description contains offensive word" });

	let profile_picture = cekGroupId.profile_picture;

	if (req.file) {
		if (profile_picture != "-") {
			fs.unlinkSync(`./uploads/${group_id}.png`);
		}
		fs.renameSync(`./uploads/${req.file.filename}`, `./uploads/${group_id}.png`);
		profile_picture = `./uploads/${group_id}.png`;
	}
	//API HIT 3
	const temp = await bayar_api_hit(validation_token.developer_id, 3);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	const group = await db.Groups.update(
		{
			user_id: user_id,
			group_name: group_name,
			group_description: group_description,
			profile_picture: profile_picture,
		},
		{
			where: {
				group_id: group_id,
			},
		}
	);

	const developer = await db.Developers.findByPk(validation_token.developer_id);

	return res.status(201).send({
		group_id: group_id,
		developer_name: developer.username,
		user_id: user_id,
		group_name: group_name,
		group_description: group_description,
		profile_picture: profile_picture,
		created_at: cekGroupId.created_at,
	});
});

// NO 3 (FIKO)
app.delete("/api/group/:group_id", async function (req, res) {
	const { group_id } = req.params;

	let token = req.header("x-auth-token");
	if (!req.header("x-auth-token")) {
		return res.status(403).send({ message: "Authentication required" });
	}
	try {
		validation_token = jwt.verify(token, JWT_KEY);
	} catch (err) {
		return res.status(400).send({ message: "Invalid JWT Key" });
	}

	if (!group_id) {
		return res.status(401).send({
			message: "Group_id cannot be empty!",
		});
	}

	const cekGroupId = await db.Groups.findByPk(group_id);

	if (!cekGroupId) {
		return res.status(404).send({
			message: "Group_id not found!",
		});
	}

	const cekGroup = await db.Groups.findOne({
		where: {
			group_id: group_id,
			developer_id: validation_token.developer_id,
		},
	});
	if (!cekGroup) {
		return res.status(404).send({
			message: "Developer cannot delete this group!",
		});
	}
	//API HIT 2
	const temp = await bayar_api_hit(validation_token.developer_id, 2);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	if (cekGroup.profile_picture != "-") {
		fs.unlinkSync(`./uploads/${group_id}.png`);
	}
	// fs.unlinkSync(`./uploads/${group_id}.png`);
	await db.Groups.destroy({
		where: {
			group_id: group_id,
		},
	});
	
	return res.status(201).send({
		message: `Success delete ${cekGroupId.group_name}`,
	});
});

// NO 4 (FIKO)
app.get("/api/group/:group_id", async function (req, res) {
	let { group_id } = req.params;

	let token = req.header("x-auth-token");
	if (!req.header("x-auth-token")) {
		return res.status(403).send({ message: "Authentication required" });
	}
	try {
		validation_token = jwt.verify(token, JWT_KEY);
	} catch (err) {
		return res.status(400).send({ message: "Invalid JWT Key" });
	}

	if (!group_id) {
		return res.status(401).send({
			message: "Group_id cannot be empty!",
		});
	}

	const cekGroupId = await db.Groups.findByPk(group_id);
	if (!cekGroupId) {
		return res.status(404).send({
			message: "Group_id not found!",
		});
	}
	//API HIT 2
	const temp = await bayar_api_hit(validation_token.developer_id, 2);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	const developer = await db.Developers.findByPk(cekGroupId.developer_id);

	return res.status(201).send({
		group_id: group_id,
		developer_name: developer.username,
		user_id: cekGroupId.user_id,
		group_name: cekGroupId.group_name,
		group_description: cekGroupId.group_description,
		profile_picture: cekGroupId.profile_picture,
		created_at: cekGroupId.created_at,
	});
});

//Thread =========================================
// (Geo)

// No1
app.post("/api/thread", cekToken, async (req, res) => {
	let { group_id, user_id, thread_name, thread_description } = req.body;
	let user = req.user;
	let developer_id = user.developer_id;
	let developer = await db.Developers.findByPk(developer_id);
	group_id = group_id.toUpperCase();

	// Validation
	if (!group_id || !user_id || !thread_name || !thread_description) {
		return res.status(400).send({
			message: "All fields are required!",
		});
	}

	let group = await db.Groups.findByPk(group_id);
	if (!group) {
		return res.status(404).send({
			message: "Group not found!",
		});
	}
	if (group.developer_id != developer_id) {
		return res.status(404).send({
			message: "Developer cannot create this thread!",
		});
	}

	let group_members = await db.Group_members.findAll({
		where: {
			group_id: group_id,
		},
	});

	let validMember = false;
	group_members.forEach((gMem) => {
		if (gMem.user_id == user_id) {
			validMember = true;
		}
	});
	if (validMember == false) {
		return res.status(400).send({
			message: `${user_id} is not part of a group ${group.group_name}!`,
		});
	}

	if (await profanityChecker(await translateText(thread_name)) === true) {
		return res.status(401).send({
			message: "Thread_name contains offensive word",
		});
	}
	if (await profanityChecker(await translateText(thread_description)) === true) {
		return res.status(401).send({
			message: "Thread_description contains offensive word",
		});
	}

	var now = new Date();
	var hour = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0") + ":" + now.getSeconds().toString().padStart(2, "0");
	var date = now.getFullYear().toString().padStart(4, "0") + "-" + (now.getMonth() + 1).toString().padStart(2, "0") + "-" + now.getDate().toString().padStart(2, "0");
	var fullDate = date + " " + hour;

	// ID
	let newID = await generateThreadID();

	// Insert
	//API HIT 3
	const temp = await bayar_api_hit(developer_id, 3);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	try {
		thread = await db.Threads.create({
			thread_id: newID,
			group_id: group_id,
			user_id: user_id,
			thread_name: thread_name,
			thread_description: thread_description,
			created_at: fullDate,
		});
	} catch (error) {
		return res.status(400).send({
			message: "Insert Failed",
			error,
		});
	}

	return res.status(201).send({
		thread_id: newID,
		thread_name: thread_name,
		thread_description: thread_description,
		created_at: fullDate,
	});
});

// No2
app.put("/api/thread/:thread_id", cekToken, async (req, res) => {
	let { thread_id } = req.params;
	let { user_id, thread_name, thread_description } = req.body;
	let user = req.user;
	let developer_id = user.developer_id;
	let developer = await db.Developers.findByPk(developer_id);

	let thread = await db.Threads.findByPk(thread_id);
	if (!thread) {
		return res.status(404).send({
			message: "Thread not found!",
		});
	}

	let group = await db.Groups.findByPk(thread.group_id);
	let groupMembers = await db.Group_members.findAll({
		where: {
			group_id: thread.group_id,
		},
	});

	if (group.developer_id != developer_id) {
		return res.status(404).send({
			message: "Developer is not the owner of this thread!",
		});
	}

	if (user_id) {
		let validMem = false;
		groupMembers.forEach((gMem) => {
			if (gMem.user_id == user_id) {
				validMem = true;
			}
		});
		if (validMem == false) {
			return res.status(400).send({
				message: `${user_id} is not part of a group ${group.group_name}!`,
			});
		}

		try {
			tempThread = await db.Threads.update(
				{
					user_id: user_id,
				},
				{
					where: {
						thread_id: thread_id,
					},
				}
			);
		} catch (error) {
			return res.status(400).send({
				message: "Update Failed",
				error,
			});
		}
	}

	if (thread_name && thread_description) {

		if (await profanityChecker(await translateText(thread_name)) === true) {
			return res.status(401).send({
				message: "Thread_name contains offensive word",
			});
		}
		if (await profanityChecker(await translateText(thread_description)) === true) {
			return res.status(401).send({
				message: "Thread_description contains offensive word",
			});
		}
	}

	if (thread_name) {

		if (await profanityChecker(await translateText(thread_name)) === true) {
			return res.status(401).send({
				message: "Thread_name contains offensive word",
			});
		}

		try {
			tempThread = await db.Threads.update(
				{
					thread_name: thread_name,
				},
				{
					where: {
						thread_id: thread_id,
					},
				}
			);
		} catch (error) {
			return res.status(400).send({
				message: "Update Failed",
				error,
			});
		}
	}

	if (thread_description) {

		if (await profanityChecker(await translateText(thread_description)) === true) {
			return res.status(401).send({
				message: "Thread_description contains offensive word",
			});
		}

		try {
			tempThread = await db.Threads.update(
				{
					thread_description: thread_description,
				},
				{
					where: {
						thread_id: thread_id,
					},
				}
			);
		} catch (error) {
			return res.status(400).send({
				message: "Update Failed",
				error,
			});
		}
	}

	// Updated Info
	//API HIT 2
	const temp = await bayar_api_hit(developer_id, 2);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	thread = await db.Threads.findByPk(thread_id);

	return res.status(201).send({
		thread_id: thread_id,
		user_id: thread.user_id,
		thread_name: thread.thread_name,
		thread_description: thread.thread_description,
	});
});

// No3
app.delete("/api/thread/:thread_id", cekToken, async (req, res) => {
	let { thread_id } = req.params;
	let user = req.user;
	let developer_id = user.developer_id;
	let developer = await db.Developers.findByPk(developer_id);

	let thread = await db.Threads.findByPk(thread_id);
	if (!thread) {
		return res.status(400).send({
			message: "Thread not found!",
		});
	}
	let group = await db.Groups.findByPk(thread.group_id);
	if (group.developer_id != developer_id) {
		return res.status(404).send({
			message: "Developer is not the owner of this thread!",
		});
	}

	// DELETE
	const temp = await bayar_api_hit(developer_id, 2);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	try {
		tempThread = await db.Threads.destroy({
			where: {
				thread_id: thread_id,
			},
		});
	} catch (error) {
		return res.status(400).send({
			message: "Delete Failed",
			error,
		});
	}

	return res.status(200).send({
		message: "Thread berhasil dihapus!",
	});
});

// No4
app.get("/api/thread/:thread_id", cekToken, async (req, res) => {
	let { thread_id } = req.params;
	let user = req.user;
	let developer_id = user.developer_id;
	let developer = await db.Developers.findByPk(developer_id);

	let thread = await db.Threads.findByPk(thread_id);
	if (!thread) {
		return res.status(400).send({
			message: "Thread not found!",
		});
	}
	let group = await db.Groups.findByPk(thread.group_id);
	if (group.developer_id != developer_id) {
		return res.status(404).send({
			message: "Developer is not the owner of this thread!",
		});
	}
	//API HIT 2
	const temp = await bayar_api_hit(developer_id, 2);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	return res.status(200).send({
		thread_id: thread.thread_id,
		user_id: thread.user_id,
		thread_name: thread.thread_name,
		thread_description: thread.thread_description,
	});
});

//Post =========================================
// (Alvin)

app.post("/api/post", uploadFile.single("post_file"), async (req, res) => {
	let { thread_id, user_id, post_name, post_description } = req.body;

	let token = req.header("x-auth-token");
	if (!req.header("x-auth-token")) {
		return res.status(403).send({ message: "Authentication required" });
	}
	try {
		validation_token = jwt.verify(token, JWT_KEY);
	} catch (err) {
		return res.status(400).send({ message: "Invalid JWT Key" });
	}

	if (!thread_id) return res.status(401).send({ message: "Thread_id cannot be empty!" });

	let thread = await db.Threads.findByPk(thread_id);
	if (!thread) return res.status(404).send({ message: "Thread_id not found!" });
	let cekGroup = await db.Groups.findByPk(thread.group_id);
	if (cekGroup.developer_id !== validation_token.developer_id) return res.status(404).send({ message: "Developer cannot create this post!" });
	if (!user_id) return res.status(401).send({ message: "User_id cannot be empty!" });
	let member = await db.Group_members.findOne({
		where: {
			group_id: cekGroup.group_id,
			user_id: user_id,
		},
	});
	if (!member) return res.status(404).send({ message: "User cannot create this post!" });
	if (!post_name) return res.status(401).send({ message: "Post_name cannot be empty!" });

	let jml = await db.Posts.findAndCountAll();
	let id = "POS" + (parseInt(jml.count) + 1).toString().padStart(3, "0");

	if (await profanityChecker(await translateText(post_name)) === true) return res.status(401).send({ message: "Post_name contains offensive word" });
	if (await profanityChecker(await translateText(post_description)) === true) return res.status(401).send({ message: "Post_description contains offensive word" });
	let file = "";
	if (!post_description) post_description = "-";
	if (req.file) {
		let temp = req.file.originalname.split(".");
		const oldExt = temp[temp.length - 1];
		const filename = `${id}.${oldExt}`;
		fs.renameSync(`./uploads/${req.file.filename}`, `./uploads/${filename}`);
		file = `./uploads/${filename}`;
	}

	var now = new Date();
	var hour = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0") + ":" + now.getSeconds().toString().padStart(2, "0");
	var date = now.getFullYear().toString().padStart(4, "0") + "-" + (now.getMonth() + 1).toString().padStart(2, "0") + "-" + now.getDate().toString().padStart(2, "0");
	var fullDate = date + " " + hour;
	//API HIT 2
	const temp = await bayar_api_hit(validation_token.developer_id, 2);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	await db.Posts.create({
		post_id: id,
		thread_id: thread_id,
		user_id: user_id,
		post_name: post_name,
		post_description: post_description,
		post_image: file,
		created_at: fullDate,
	});

	return res.status(201).send({
		post_id: id,
		post_name: post_name,
		post_description: post_description,
		link_post_file: file,
		views: 0,
		like: {},
		dislike: {},
		created_at: fullDate,
	});
});

app.put("/api/post/:post_id", uploadFile.single("post_file"), async (req, res) => {
	let { user_id, post_name, post_description, action } = req.body;
	let { post_id } = req.params;
	let token = req.header("x-auth-token");
	if (!req.header("x-auth-token")) {
		return res.status(403).send({ message: "Authentication required" });
	}
	try {
		validation_token = jwt.verify(token, JWT_KEY);
	} catch (err) {
		return res.status(400).send({ message: "Invalid JWT Key" });
	}

	if (!post_id) return res.status(401).send({ message: "Post_id cannot be empty!" });

	let post = await db.Posts.findByPk(post_id);
	if (!post) return res.status(404).send({ message: "Post_id not found!" });

	let thread = await db.Threads.findByPk(post.thread_id);
	let cekGroup = await db.Groups.findByPk(thread.group_id);
	if (!user_id) user_id = post.user_id;
	if (cekGroup.developer_id !== validation_token.developer_id) return res.status(404).send({ message: "Developer cannot edit this post!" });
	let member = await db.Group_members.findOne({
		where: {
			group_id: cekGroup.group_id,
			user_id: user_id,
		},
	});
	if (!member) return res.status(404).send({ message: "User cannot create this post!" });

	if (!post_description && !req.file && !post_name && !action) return res.status(401).send({ message: "At least 1 field must be filled!" });
	if (post_name == "") return res.status(401).send({ message: "Post_name cannot be empty string!" });

	if (post_name) {
		if (await profanityChecker(await translateText(post_name)) === true) return res.status(401).send({ message: "Post_name contains offensive word" });
	}
	if (post_description) {
		if (await profanityChecker(await translateText(post_description)) === true) return res.status(401).send({ message: "Post_name contains offensive word" });
	}

	if (post_description) post.set({ post_description: post_description });
	if (post_name) post.set({ post_name: post_name });
	post.set({ user_id: user_id });

	if (action && action != "like" && action != "dislike") return res.status(401).send({ message: "Invalid Action" });
	let prevLike = JSON.parse(post.likes);
	if (!prevLike) prevLike = [];

	let prevDislike = JSON.parse(post.dislikes);
	if (!prevDislike) prevDislike = [];

	let temp = "";
	let idxLike = prevLike.indexOf(user_id);
	let idxDislike = prevDislike.indexOf(user_id);
	if (action && idxLike != -1) {
		temp = "You've unlike the post";
		prevLike.splice(idxLike, 1);
		if (action == "dislike") temp = "";
	} else if (action && idxDislike != -1) {
		temp = "You've undislike the post";
		prevDislike.splice(idxDislike, 1);
		if (action == "like") temp = "";
	}

	if (action && temp == "") {
		if (action == "like") {
			prevLike.push(user_id);
			temp = "You've like the post";
		} else {
			prevDislike.push(user_id);
			temp = "You've dislike the post";
		}
	}
	post.set({
		likes: prevLike,
		dislikes: prevDislike,
	});
	if (req.file) {
		if (post.post_image != "") fs.unlinkSync(`./${post.post_image}`);
		let temp = req.file.originalname.split(".");
		const oldExt = temp[temp.length - 1];
		const filename = `${post.post_id}.${oldExt}`;
		fs.renameSync(`./uploads/${req.file.filename}`, `./uploads/${filename}`);
		post.set({ post_image: `./uploads/${filename}` });
	}
	const temp2 = await bayar_api_hit(validation_token.developer_id, 3);
	if (temp2 == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	await post.save();
	//API HIT 3
	return res.status(200).send({
		message: temp != "" ? temp : "Success",
		post_id: post.post_id,
		user_id: post.user_id,
		post_name: post.post_name,
		post_description: post.post_description,
		link_post_file: post.post_image,
		like: prevLike,
		dislike: prevDislike,
	});
});

app.delete("/api/post/:post_id", async (req, res) => {
	let { post_id } = req.params;
	let token = req.header("x-auth-token");
	if (!req.header("x-auth-token")) {
		return res.status(403).send({ message: "Authentication required" });
	}
	try {
		validation_token = jwt.verify(token, JWT_KEY);
	} catch (err) {
		return res.status(400).send({ message: "Invalid JWT Key" });
	}

	if (!post_id) return res.status(401).send({ message: "Post_id cannot be empty!" });

	let post = await db.Posts.findByPk(post_id);
	if (!post) return res.status(404).send({ message: "Post_id not found!" });
	let thread = await db.Threads.findByPk(post.thread_id);
	let cekGroup = await db.Groups.findByPk(thread.group_id);
	if (cekGroup.developer_id !== validation_token.developer_id) return res.status(404).send({ message: "Developer cannot delete this post!" });
	fs.unlinkSync(`./${post.post_image}`);
	let name = post.post_name;
	//API HIT 2
	const temp = await bayar_api_hit(validation_token.developer_id, 2);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	await db.Posts.destroy({
		where: {
			post_id: post_id,
		},
	});
	return res.status(201).send({
		message: `Success delete ${name}`,
	});
});

app.get("/api/post/trending", async (req, res) => {
	let token = req.header("x-auth-token");
	if (!req.header("x-auth-token")) {
		return res.status(403).send({ message: "Authentication required" });
	}
	try {
		validation_token = jwt.verify(token, JWT_KEY);
	} catch (err) {
		return res.status(400).send({ message: "Invalid JWT Key" });
	}
	//API HIT 2
	const temp = await bayar_api_hit(validation_token.developer_id, 2);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	let data = await db.Posts.findAll({
		order: [["views", "DESC"]],
	});
	return res.status(200).send(data);
});

app.get("/api/post/:post_id", async (req, res) => {
	let { post_id } = req.params;

	let token = req.header("x-auth-token");
	if (!req.header("x-auth-token")) {
		return res.status(403).send({ message: "Authentication required" });
	}
	try {
		validation_token = jwt.verify(token, JWT_KEY);
	} catch (err) {
		return res.status(400).send({ message: "Invalid JWT Key" });
	}

	if (!post_id) {
		return res.status(401).send({
			message: "Post_id cannot be empty!",
		});
	}

	const post = await db.Posts.findByPk(post_id);
	if (!post) {
		return res.status(404).send({
			message: "Post_id not found!",
		});
	}
	const temp = await bayar_api_hit(validation_token.developer_id, 2);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	await post.increment({ views: 1 });
	await post.reload();
	let prevLike = JSON.parse(post.likes);
	if (!prevLike) prevLike = [];

	let prevDislike = JSON.parse(post.dislikes);
	if (!prevDislike) prevDislike = [];

	//API HIT 2

	return res.status(201).send({
		post_id: post_id,
		user_id: post.user_id,
		post_name: post.post_name,
		group_description: post.post_description,
		link_post_file: post.post_image,
		views: post.views,
		likes: prevLike,
		dislike: prevDislike,
		created_at: post.created_at,
	});
});

//Comment =========================================
// MASIH BELUM
// (Alvin)
app.post("/api/comment", async (req, res) => {
	let { post_id, user_id, comment } = req.body;

	let token = req.header("x-auth-token");
	if (!req.header("x-auth-token")) {
		return res.status(403).send({ message: "Authentication required" });
	}
	try {
		validation_token = jwt.verify(token, JWT_KEY);
	} catch (err) {
		return res.status(400).send({ message: "Invalid JWT Key" });
	}

	if (!post_id) return res.status(401).send({ message: "Post_id cannot be empty!" });
	if (!user_id) return res.status(401).send({ message: "User_id cannot be empty!" });
	let post = await db.Posts.findByPk(post_id);
	if (!post) return res.status(404).send({ message: "Post_id not found!" });
	let thread = await db.Threads.findByPk(post.thread_id);
	let cekGroup = await db.Groups.findByPk(thread.group_id);
	if (cekGroup.developer_id !== validation_token.developer_id) return res.status(404).send({ message: "Developer cannot create this comment!" });
	let member = await db.Group_members.findOne({
		where: {
			group_id: cekGroup.group_id,
			user_id: user_id,
		},
	});
	if (!member) return res.status(404).send({ message: "User cannot create this comment!" });
	if (!comment) return res.status(401).send({ message: "Comment cannot be empty!" });

	if (await profanityChecker(await translateText(comment)) === true) return res.status(401).send({ message: "Comment contains offensive word" });

	var now = new Date();
	var hour = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0") + ":" + now.getSeconds().toString().padStart(2, "0");
	var date = now.getFullYear().toString().padStart(4, "0") + "-" + (now.getMonth() + 1).toString().padStart(2, "0") + "-" + now.getDate().toString().padStart(2, "0");
	var fullDate = date + " " + hour;

	//API HIT 2
	const temp = await bayar_api_hit(validation_token.developer_id, 2);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	await db.Comments.create({
		post_id: post_id,
		user_id: user_id,
		comment: comment,
		created_at: fullDate,
	});

	return res.status(201).send({
		comment: comment,
		created_at: fullDate
	});
});

// (Fiko)
app.delete("/api/comment/:comment_id", async function (req, res) {
	let { comment_id } = req.params;

	let token = req.header("x-auth-token");
	if (!req.header("x-auth-token")) {
		return res.status(403).send({ message: "Authentication required" });
	}
	try {
		validation_token = jwt.verify(token, JWT_KEY);
	} catch (err) {
		return res.status(400).send({ message: "Invalid JWT Key" });
	}
	let comment = await db.Comments.findByPk(comment_id);
	if (!comment) return res.status(404).send({ message: "Comment_id not found! " })
	let post = await db.Posts.findByPk(comment.post_id);
	let thread = await db.Threads.findByPk(post.thread_id);
	let cekGroup = await db.Groups.findByPk(thread.group_id);
	if (cekGroup.developer_id !== validation_token.developer_id) return res.status(404).send({ message: "Developer cannot delete this comment!" });
	//API HIT 2
	const temp = await bayar_api_hit(validation_token.developer_id, 2);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	await db.Comments.destroy({
		where: {
			comment_id: comment_id
		}
	})
	return res.status(201).send({
		comment: comment.comment,
		message: `This comment was successfully deleted!`
	})
})

// (Geo)
app.put("/api/comment/:comment_id", cekToken, async (req, res) => {
	let { comment_id } = req.params;
	let user = req.user;
	let developer_id = user.developer_id;
	let developer = await db.Developers.findByPk(developer_id);

	let { user_id, comment } = req.body;

	let comments = await db.Comments.findByPk(comment_id);
	if (!comments) {
		return res.status(404).send({
			message: "Comment not found!"
		});
	}
	let post = await db.Posts.findByPk(comments.post_id);
	let thread = await db.Threads.findByPk(post.thread_id);
	let group = await db.Groups.findByPk(thread.group_id);
	if (group.developer_id != developer_id) {
		return res.status(404).send({
			message: "Developer cannot edit this comment!"
		})
	}

	if (user_id) {

		let groupMembers = await db.Group_members.findAll({
			where: {
				group_id: group.group_id
			}
		});
		let validMem = false;
		groupMembers.forEach(gMem => {
			if (gMem.user_id == user_id) {
				validMem = true;
			}
		});
		if (validMem == false) {
			return res.status(400).send({
				message: `${user_id} is not part of a group ${group.group_name}!`
			})
		}

		try {
			tempUser = await db.Comments.update(
				{
					user_id: user_id,
				},
				{
					where: {
						comment_id: comment_id
					},
				}
			);
		} catch (error) {
			return res.status(400).send({
				message: "Update Failed",
				error,
			});
		}
	}

	if (comment) {
		if (await profanityChecker(await translateText(comment)) === true) return res.status(401).send({ message: "Comment contains offensive word" });

		try {
			tempUser = await db.Comments.update(
				{
					comment: comment,
				},
				{
					where: {
						comment_id: comment_id
					},
				}
			);
		} catch (error) {
			return res.status(400).send({
				message: "Update Failed",
				error,
			});
		}
	}

	// Updated Data
	//API HIT 2
	const temp = await bayar_api_hit(developer_id, 2);
	if (temp == false) {
		return res.status(401).send({ messages: "Api hit is not enough!" })
	}
	comments = await db.Comments.findByPk(comment_id);

	return res.status(201).send({
		user_id: comments.user_id,
		comment: comments.comment
	})
})