//Imports
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const {config, checkPermissions} = require('../config');

router.get('/getQueueStatus', async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const course_id = req.query.course_id;
    await checkPermissions(user_id, course_id, 'INSTRUCTOR');
    const connection = await mysql.createConnection(config);
    const [results] = await connection.execute(
      `SELECT Q.queue_id, U.user_name,
      Q.queue_estimated_time,
      Q.queue_topic_description,
      Q.queue_instructor_user_id
      FROM Queues Q
      JOIN Users U
      ON Q.user_id = U.user_id 
      WHERE Q.course_id = ?
      AND (Q.queue_request_status = 'WAITING' OR Q.queue_request_status = 'IN_PROGRESS') 
      ORDER BY Q.queue_timestamp;`,
      [course_id]
    );
    await connection.end();
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/**
 * Parameters: user_id, course_id
 * This API endpoint accepts, through the body of the request, the user_id and course_id for the instructor attempting to 
 * Take the next student. If the user is authorized, the student's task will be moved to "IN_PROGRESS" with the instructor 
 * set as the instructor that is helping them.
 * 
 * Returns: Nothing. 200 on success, 401 on error.
 */
router.post('/takeNextStudent', async (req, res) => {
  try {
    console.log("Made it here take next student.");
    // receive user_id and course_id from request body.
    const user_id = req.body.user_id;
    const course_id = req.body.course_id;

    // check to make sure that this user is an instructor in this course.
    await checkPermissions(user_id, course_id, 'INSTRUCTOR');

    // Check if this instructor is already helping a student. If they are, return an error message.
    const connection = await mysql.createConnection(config);
		const [results] = await connection.execute(
			`SELECT * FROM Queues WHERE course_id = ? AND queue_request_status = "IN_PROGRESS" AND queue_instructor_user_id = ?;`,
			[course_id, user_id]
		);
		await connection.end();
		if (results.length > 0) throw new Error(`This instructor is already helping a different student.`);

    // Execute the UPDATE query to set the next person as helping for this instructor.
    const connection2 = await mysql.createConnection(config);
    const [results2] = await connection2.execute(
      `UPDATE Queues 
      SET queue_request_status = "IN_PROGRESS", queue_instructor_user_id = ?
      WHERE course_id = ? AND queue_request_status = "WAITING" ORDER BY queue_timestamp ASC LIMIT 1;`,
      [user_id, course_id]
    );
    await connection2.end();
    if (results2.affectedRows === 0) throw new Error(
      `No waiting student for Instructor ${user_id} in Course ${course_id}`
    );
    const connection3 = await mysql.createConnection(config);
    const [results3] = await connection3.execute(
            `SELECT user_id FROM Queues
            WHERE course_id = ? AND queue_request_status = "IN_PROGRESS" AND queue_instructor_user_id = ?
            ORDER BY queue_timestamp ASC LIMIT 1;`,
            [course_id, user_id]
        );
    await connection.end();
    res.status(200).send({ results3, message: 'Student removed from the queue.' });
  } catch (err) {
    console.log(err.message);
    res.status(401).send(err.message);
  }
});

router.post('/finishHelpingStudent', async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const course_id = req.body.course_id;
    await checkPermissions(user_id, course_id, 'INSTRUCTOR');
    const connection = await mysql.createConnection(config);
    const [results] = await connection.execute(
      `UPDATE Queues SET queue_request_status = 'DONE'
       WHERE queue_request_status = 'IN_PROGRESS'
       AND queue_instructor_user_id = ?`,
      [user_id]
    );
    await connection.end();
    if (results.affectedRows === 0) throw new Error(`No active student for Instructor ${user_id} in Course ${course_id}`);
    res.status(200).send({ message: 'Student marked as done in the queue.' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/removeNoShowStudent', async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const course_id = req.body.course_id;
    await checkPermissions(user_id, course_id, 'INSTRUCTOR');
    const connection = await mysql.createConnection(config);
    const [results] = await connection.execute(
      `UPDATE Queues SET queue_request_status = 'CANCELED' 
       WHERE queue_request_status = 'IN_PROGRESS' 
       AND queue_instructor_user_id = ?`,
      [user_id]
    );
    await connection.end();
    if (results.affectedRows === 0) throw new Error(
      `No active student for Instructor ${user_id} in Course ${course_id}`
    );
    res.status(200).send({ message: 'Student removed from the queue.' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/setRoomInfo', async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const permission_location = req.body.permission_location;
    const course_id = req.body.course_id;
    await checkPermissions(user_id, course_id, 'INSTRUCTOR');
    const connection = await mysql.createConnection(config);
    const [results] = await connection.execute(
      `UPDATE Permissions
      SET permission_location = ?
      WHERE user_id = ?
      AND course_id = ?;`,
      [permission_location, user_id, course_id]
    );
    await connection.end();
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/getRoomInfo', async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const course_id = req.query.course_id;
    // let the students see instructor room info
    // await checkPermissions(user_id, course_id, 'INSTRUCTOR');
    const connection = await mysql.createConnection(config);
    const [results] = await connection.execute(
      `SELECT permission_location FROM Permissions
      WHERE user_id = ? AND course_id = ?;`,
      [user_id, course_id]
    );
    await connection.end();
    res.status(200).send(results);
  } catch (err) {
    console.log(err.message);
    res.status(401).send(err.message);
  }
});

router.get('/getCurrentlyHelpingStudent', async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const course_id = req.query.course_id;
    await checkPermissions(user_id, course_id, 'INSTRUCTOR');
    const connection = await mysql.createConnection(config);
    const [results] = await connection.execute(
      `SELECT U.user_name, Q.queue_topic_description, Q.queue_estimated_time
      FROM Queues Q, Users U
      WHERE U.user_id = Q.user_id
      AND Q.queue_request_status = 'IN_PROGRESS'
      AND Q.queue_instructor_user_id = ?
      AND Q.course_id = ?`,
      [user_id, course_id]
    );
    await connection.end();
    res.status(200).send(results);
  } catch (err) {
    console.log(err.message)
    res.status(401).send(err.message);
  }
});

module.exports = router;