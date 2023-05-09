const express = require("express");
const router = express.Router();
const {connect, checkPermissions} = require("../config");

router.get("/getEnrolledCourses", async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const [results] = await connect(
      `SELECT DISTINCT C.course_id, C.course_name, P.permission_type,
      C.course_student_join_code, C.course_instructor_join_code
        FROM Permissions P JOIN Courses C
        ON P.course_id = C.course_id
        WHERE P.user_id = ?;`,
        [user_id]
    );
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/joinCourse', async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const join_code = req.body.join_code;
    if (!join_code) throw new Error('Invalid Join Code Input.');
    // determine if join code is student or instructor
    const [results] = await connect(
      `SELECT course_id, course_name, course_description,
      course_student_join_code AS course_join_code, 'STUDENT' AS permission_type
      FROM Courses
      WHERE course_student_join_code=?
      UNION
      SELECT course_id, course_name, course_description,
      course_instructor_join_code AS course_join_code, 'INSTRUCTOR' AS permission_type
      FROM Courses
      WHERE course_instructor_join_code=?;`,[join_code, join_code]
    );
    if (!results.length) throw new Error(`Invalid Join Code Database.`);
    console.log(results[0]);
    const course_id = results[0]["course_id"];
    const permission_type = results[0]["permission_type"];
    console.log(permission_type);
      
    // Add this user with their appropriate permission
    const [results3] = await connect(
    `INSERT INTO Permissions (course_id, user_id, permission_type) VALUES (?, ?, ?);`,
    [course_id, user_id, permission_type]
    );
    if (results3.affectedRows === 0) throw new Error(
      `Error adding new permissions`
    );  
    res.status(200).send({ message: 'Course has been added.' });
  } catch (err) {
    console.log(err.message);
    res.status(401).send(err.message);
  }
});

router.post('/createCourse', async (req, res) => {
  try {
    console.log("POST/createCourse");
    const user_id = req.body.user_id;
    const course_name = req.body.course_name;
    const course_description = req.body.course_description;

    const course_student_join_code = generateNcharAlphaCode(5);
    const course_instructor_join_code = generateNcharAlphaCode(8);
    

    // Create a new course in the course table. 
		const [results] = await connect(
			`INSERT INTO Courses (course_name, course_description, course_student_join_code, course_instructor_join_code) VALUES (?, ?, ?, ?);`,
			[course_name, course_description, course_student_join_code, course_instructor_join_code]
		);

    // get the course ID of the entry that we just made.
    const [results2] = await connect(
			`SELECT LAST_INSERT_ID();`,
			[course_name, course_description, course_student_join_code, course_instructor_join_code]
		);
		if (results.length === 0) throw new Error(`Error Inserting entry into courses table.`);

    const course_id = results2[0]['LAST_INSERT_ID()'];
    console.log(course_id);
    const [results3] = await connect(
      `INSERT INTO Permissions (course_id, user_id, permission_type) VALUES (?, ?, "INSTRUCTOR");`,
      [course_id, user_id]
    );
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
 * Returns a pseudorandom code.
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

router.get("/GetCourseJoinCodes", async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const course_id = req.query.course_id;
    await checkPermissions(user_id, course_id, 'INSTRUCTOR');
    const [results] = await connect(
      `SELECT course_student_join_code, course_instructor_join_code FROM Courses WHERE course_id = ?;`,
      [course_id]
    );
    res.status(200).send(results);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

module.exports = router;