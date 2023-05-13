//Imports
const express = require('express');
const router = express.Router();
const { connect } = require('../config');

router.post('/signIn', async (req, res) => {
	try {
		console.log("POST/signIn");
		const {username, password} = req.body;
		console.log(username, password);
		const [results] = await connect(
			`SELECT * FROM Users WHERE user_email = ? AND user_password = ?`,
			[username, password]
		);
		console.log(results);
		if (!results.length) throw new Error(`Invalid password`);
		res.status(200).send({user_id: results[0].user_id}); 
	} catch (err) {
		console.error(err.message);
		res.status(401).send(err.message);
	}
});

router.post('/createAccount', async (req, res) => {
	try {
		console.log("POST/createAccount")
		const {name, email, password} = req.body;
		const [results] = await connect(
			`INSERT INTO Users (user_name, user_email, user_password) VALUES
			(?,?,?);`,
			[name, email, password]
		);
		res.status(200).send(); 
	} catch (err) {
		res.status(401).send(err.message);
	}
});

module.exports = router;