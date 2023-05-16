//Imports
const express = require('express');
const router = express.Router();
const {connect, checkPermissions} = require('../config');

router.get('/getQueueStatus', async (req, res) => {
  try {
    const {user_id, course_id} = req.query;
    await checkPermissions(user_id, course_id, 'INSTRUCTOR');
    const [results] = await connect(
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
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/takeNextStudent', async (req, res) => {
  try {
    console.log("POST/takeNextStudent");
    const {user_id, course_id} = req.body;
    await checkPermissions(user_id, course_id, 'INSTRUCTOR');
		const [results] = await connect(
			`SELECT * FROM Queues WHERE course_id = ? AND queue_request_status = "IN_PROGRESS" AND queue_instructor_user_id = ?;`,
			[course_id, user_id]
		);
		if (results.length > 0) throw new Error(`This instructor is already helping a different student.`);
    const [results2] = await connect(
      `UPDATE Queues 
      SET queue_request_status = "IN_PROGRESS", queue_instructor_user_id = ?
      WHERE course_id = ? AND queue_request_status = "WAITING" ORDER BY queue_timestamp ASC LIMIT 1;`,
      [user_id, course_id]
    );
    if (results2.affectedRows === 0) throw new Error(
      `No waiting student for Instructor ${user_id} in Course ${course_id}`
    );
    const [results3] = await connect(
            `SELECT user_id FROM Queues
            WHERE course_id = ? AND queue_request_status = "IN_PROGRESS" AND queue_instructor_user_id = ?
            ORDER BY queue_timestamp ASC LIMIT 1;`,
            [course_id, user_id]
        );
    res.status(200).send({ results3, message: 'Student removed from the queue.' });
  } catch (err) {
    res.status(401).send(err.message);
  }
});

router.post('/finishHelpingStudent', async (req, res) => {
  try {
    console.log('POST/finishHelpingStudent');
    const {user_id, course_id} = req.body;
    await checkPermissions(user_id, course_id, 'INSTRUCTOR');
    const [results] = await connect(
      `UPDATE Queues SET queue_request_status = 'DONE'
       WHERE queue_request_status = 'IN_PROGRESS'
       AND queue_instructor_user_id = ?`,
      [user_id]
    );
    if (results.affectedRows === 0) throw new Error(`No active student for Instructor ${user_id} in Course ${course_id}`);
    res.status(200).send({ message: 'Student marked as done in the queue.' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/removeNoShowStudent', async (req, res) => {
  try {
    console.log('POST/removeNoShowStudent');
    const {user_id, course_id} = req.body;
    await checkPermissions(user_id, course_id, 'INSTRUCTOR');
    const [results] = await connect(
      `UPDATE Queues SET queue_request_status = 'CANCELED' 
       WHERE queue_request_status = 'IN_PROGRESS' 
       AND queue_instructor_user_id = ?`,
      [user_id]
    );
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
    console.log('POST/setRoomInfo');
    const {user_id, permission_location, course_id} = req.body;
    await checkPermissions(user_id, course_id, 'INSTRUCTOR');
    const [results] = await connect(
      `UPDATE Permissions
      SET permission_location = ?
      WHERE user_id = ?
      AND course_id = ?;`,
      [permission_location, user_id, course_id]
    );
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/getRoomInfo', async (req, res) => {
  try {
    const {user_id, course_id} = req.query;
    // no checkPermissions so students can see
    const [results] = await connect(
      `SELECT permission_location FROM Permissions
      WHERE user_id = ? AND course_id = ?;`,
      [user_id, course_id]
    );
    res.status(200).send(results);
  } catch (err) {
    console.log(err.message);
    res.status(401).send(err.message);
  }
});

router.get('/getCurrentlyHelpingStudent', async (req, res) => {
  try {
    const {user_id, course_id} = req.query;
    await checkPermissions(user_id, course_id, 'INSTRUCTOR');
    const [results] = await connect(
      `SELECT U.user_name, Q.queue_topic_description, Q.queue_estimated_time
      FROM Queues Q, Users U
      WHERE U.user_id = Q.user_id
      AND Q.queue_request_status = 'IN_PROGRESS'
      AND Q.queue_instructor_user_id = ?
      AND Q.course_id = ?`,
      [user_id, course_id]
    );
    res.status(200).send(results);
  } catch (err) {
    res.status(401).send(err.message);
  }
});

module.exports = router;