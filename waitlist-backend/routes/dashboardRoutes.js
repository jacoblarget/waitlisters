//Imports
const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const {config, checkPermissions} = require("../config");

/**
 * Returns a list of all courses the user is enrolled in as an instructor.
 */
router.get("/GetCoursesEnrolledAsInstructor", async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const connection = await mysql.createConnection(config);
    const [results] = await connection.execute(
      `SELECT DISTINCT P.course_id, C.course_name 
            FROM Permissions P
            JOIN Courses C
            ON P.course_id = C.course_id
            WHERE P.user_id = ?
            AND P.permission_type = 'INSTRUCTOR';`,
      [user_id]
    );
    await connection.end();
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/**
 * Returns a list of all courses the user is enrolled in as a student.
 */
router.get("/GetCoursesEnrolledAsStudent", async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const connection = await mysql.createConnection(config);
    const [results] = await connection.execute(
      `SELECT DISTINCT P.course_id, C.course_name 
            FROM Permissions P
            JOIN Courses C
            ON P.course_id = C.course_id
            WHERE P.user_id = ?
            AND P.permission_type = 'STUDENT';`,
      [user_id]
    );
    await connection.end();
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/**
 * This API endpoint allows a user to create a new course and be added as an instructor.
 */
router.post('/createCourse', async (req, res) => {
  try {
    console.log("Made it here create course.");
    // recieve parameters from request body.
    const user_id = req.body.user_id;
    const course_name = req.body.course_name;
    const course_description = req.body.course_description;

    const course_student_join_code = generateNcharAlphaCode(5);
    const course_instructor_join_code = generateNcharAlphaCode(8);
    

    // Create a new course in the course table. 
    const connection = await mysql.createConnection(config);
		const [results] = await connection.execute(
			`INSERT INTO Courses (course_name, course_description, course_student_join_code, course_instructor_join_code) VALUES (?, ?, ?, ?);`,
			[course_name, course_description, course_student_join_code, course_instructor_join_code]
		);

    // get the course ID of the entry that we just made.
    const [results2] = await connection.execute(
			`SELECT LAST_INSERT_ID();`,
			[course_name, course_description, course_student_join_code, course_instructor_join_code]
		);

		await connection.end();
		if (results.length === 0) throw new Error(`Error Inserting entry into courses table.`);

    const course_id = results2[0]['LAST_INSERT_ID()'];
    console.log(course_id);
      
    // Add the appropriate entry to the permissions table to add this user as an instructor.
    const connection3 = await mysql.createConnection(config);
    const [results3] = await connection3.execute(
      `INSERT INTO Permissions (course_id, user_id, permission_type) VALUES (?, ?, "INSTRUCTOR");`,
      [course_id, user_id]
    );
    await connection3.end();
    if (results3.affectedRows === 0) throw new Error(
      `Error adding new permissions for the newly created course`
    );
    
    res.status(200).send({ message: 'Course has been created.', course_id: course_id });
  } catch (err) {
    console.log(err.message);
    res.status(401).send(err.message);
  }
});

/**
 * This API endpoint allows a user to join an existing course as a student.
 */
router.post('/joinExistingCourseAsStudent', async (req, res) => {
  try {
    console.log("Made it here student join course.");
    // recieve parameters from request body.
    const user_id = req.body.user_id;
    const course_student_join_code = req.body.course_student_join_code;

    // Retrieve the course_id from the join code.
    const connection = await mysql.createConnection(config);
		const [results] = await connection.execute(
			`select * from Courses where course_student_join_code = ?;`,
			[course_student_join_code]
		);
		await connection.end();
		if (results.length === 0) throw new Error(`Not a valid student join code.`);

    const course_id = results[0]["course_id"];
    console.log(course_id);
      
    // Add the appropriate entry to the permissions table to add this user as a student.
    const connection3 = await mysql.createConnection(config);
    const [results3] = await connection3.execute(
      `INSERT INTO Permissions (course_id, user_id, permission_type) VALUES (?, ?, "STUDENT");`,
      [course_id, user_id]
    );
    await connection3.end();
    if (results3.affectedRows === 0) throw new Error(
      `Error adding new permissions`
    );
    
    res.status(200).send({ message: 'Course has been added.' });
  } catch (err) {
    console.log(err.message);
    res.status(401).send(err.message);
  }
});

/**
 * This API endpoint allows a user to join an existing course as an instructor.
 */
router.post('/joinExistingCourseAsInstructor', async (req, res) => {
  try {
    console.log("Made it here instructor join course.");
    // recieve parameters from request body.
    const user_id = req.body.user_id;
    const course_instructor_join_code = req.body.course_instructor_join_code;

    // Retrieve the course_id from the join code.
    const connection = await mysql.createConnection(config);
		const [results] = await connection.execute(
			`select * from Courses where course_instructor_join_code = ?;`,
			[course_instructor_join_code]
		);
		await connection.end();
		if (results.length === 0) throw new Error(`Not a valid instructor join code.`);

    const course_id = results[0]["course_id"];
    console.log(course_id);
      
    // Add the appropriate entry to the permissions table to add this user as a student.
    const connection3 = await mysql.createConnection(config);
    const [results3] = await connection3.execute(
      `INSERT INTO Permissions (course_id, user_id, permission_type) VALUES (?, ?, "INSTRUCTOR");`,
      [course_id, user_id]
    );
    await connection3.end();
    if (results3.affectedRows === 0) throw new Error(
      `Error adding new permissions`
    );
    
    res.status(200).send({ message: 'Course has been added.' });
  } catch (err) {
    console.log(err.message);
    res.status(401).send(err.message);
  }
});

/**
 * Returns a sudo-random code.
 * @param {*} N The length of the code
 * @returns the N char Alpha code
 */
function generateNcharAlphaCode(N){
  alphabetUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  alphabetLower = "abcdefghijklmnopqrstuvwxyz";
  result = "";
  for (i = 0; i < N; i++){
    pos = parseInt(Math.random()*26);
    arr = parseInt(Math.random()*2);
    result += (arr) ? alphabetLower[pos] : alphabetUpper[pos];
  }
  return result;
}

/**
 * this function grabs the join codes for a given course_id from the database and returns them.
 */
router.get("/GetCourseJoinCodes", async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const course_id = req.query.course_id;
    await checkPermissions(user_id, course_id, 'INSTRUCTOR');
    const connection = await mysql.createConnection(config);
    const [results] = await connection.execute(
      `SELECT course_student_join_code, course_instructor_join_code FROM Courses WHERE course_id = ?;`,
      [course_id]
    );
    await connection.end();
    res.status(200).send(results);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

module.exports = router;