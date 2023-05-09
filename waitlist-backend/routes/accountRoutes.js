//Imports
const express = require('express');
const router = express.Router();
const {connect, checkPermissions} = require('../config');

/*
 * This api sends only the user id of the user if they are correctly authenticated
 * in the form of a json object. As follows: {user_id: <user_id>}
*/
router.get('/signIn', async (req, res) => {
	try {
		console.log("Made it here sign in.");
		const username = req.query.username;
		const password = req.query.password;
		const [results] = await connect(
			`SELECT * FROM Users WHERE user_email = ? AND user_password = ?`,
			[username, password]
		);
		if (!results.length) throw new Error(`Invalid password`);
		res.status(200).send({user_id: results[0].user_id}); 
	} catch (err) {
		res.status(401).send(err.message);
	}
});

/**
 * This route allows a user to create a new account from the register page.
 * Preconditions: Body must contain {name: "<name>", email: "<email>", password: "<password>" }
 */
router.post('/createAccount', async (req, res) => {
	try {
		const name = req.body.name;
		const email = req.body.email;
		const password = req.body.password;
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