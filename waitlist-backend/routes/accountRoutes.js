//Imports
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const {config, checkPermissions} = require('../config');

/*
 * This api sends only the user id of the user if they are correctly authenticated
 * in the form of a json object. As follows: {user_id: <user_id>}
*/
router.get('/accountSignIn', async (req, res) => {
	try {
		console.log("Made it here sign in.");
		const username = req.query.username;
		const password = req.query.password;
		const connection = await mysql.createConnection(config);
		const [results] = await connection.execute(
			`SELECT * FROM Users WHERE user_email = ? AND user_password = ?`,
			[username, password]
		);
		await connection.end();
		if (results.length === 0) throw new Error(`Incorrect password buddy boy.`);
		res.status(200).send({user_id: results[0].user_id}); 
	} catch (err) {
		res.status(401).send(err.message);
	}
});

/**
 * This route allows a user to create a new account from the register page.
 * Preconditions: Body must contain {name: "<name>", email: "<email>", password: "<password>" }
 */
router.post('/accountCreateAccount', async (req, res) => {
	try {
		// Retrieve parameters from the body of the request.
		const name = req.body.name;
		const email = req.body.email;
		const password = req.body.password;

		// Create a connection to the database and execute the query. 
		const connection = await mysql.createConnection(config);
		const [results] = await connection.execute(
			`INSERT INTO Users (user_name, user_email, user_password) VALUES
			(?,?,?);`,
			[name, email, password]
		);
		await connection.end();

		res.status(200).send(); 
	} catch (err) {
		res.status(401).send(err.message);
	}
});

module.exports = router;