//Imports
var express = require('express');
var router = express.Router();
var mysql = require('mysql2/promise'); 
const {config, checkPermissions} = require('../config');

//This route handles POST Request at /enqueue which allows a student to add themselves to the waitlist.
router.post('/enqueue', async (req, res) => {
    try {
      const user_id = req.body.user_id;
      const course_id = req.body.course_id;
      const queue_estimated_time = req.body.queue_estimated_time;
      const queue_topic_description = req.body.queue_topic_description;
      await checkPermissions(user_id, course_id, 'STUDENT');
      const connection = await mysql.createConnection(config);
      const [results] = await connection.execute(
        `INSERT INTO Queues (user_id, course_id, queue_estimated_time, queue_topic_description, queue_request_status)
        VALUES (?, ?, ?, ?, 'WAITING')`,
        [user_id, course_id, queue_estimated_time, queue_topic_description]
      );
      await connection.end();
      res.status(200).send(results);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
});

//This route handles POST Request at /exitQueue which allows a student to remove themselves from the waitlist.
router.post('/exitQueue', async (req, res) => {
    try {
      const user_id = req.body.user_id;
      const course_id = req.body.course_id;
      await checkPermissions(user_id, course_id, 'STUDENT');
      const connection = await mysql.createConnection(config);
      const [results] = await connection.execute(
        `UPDATE Queues SET queue_request_status = 'CANCELED' 
        WHERE user_id = ? AND course_id = ? AND queue_request_status = 'WAITING'`,
        [user_id, course_id]
      );
      await connection.end();
      res.status(200).send(results);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  });

 // GetQueueStatus;
 router.get('/getQueueStatus', async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const course_id = req.query.course_id;
    await checkPermissions(user_id, course_id, 'STUDENT');
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
      AND (Q.queue_request_status = 'WAITING'
      OR Q.queue_request_status = 'IN_PROGRESS')
      ORDER BY Q.queue_timestamp;`,
      [course_id]
    );
    await connection.end();
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/getEntryStatus', async (req,res) =>{
  try {
    const user_id = req.query.user_id;
    const course_id = req.query.course_id;
    await checkPermissions(user_id, course_id, 'STUDENT');
    const connection = await mysql.createConnection(config);
    const [results] = await connection.execute(
      `SELECT U.user_id, Q.queue_instructor_user_id AS instructor_id
      FROM Queues Q
      JOIN Users U
      ON Q.user_id = U.user_id 
      WHERE Q.user_id = ?
      AND Q.course_id = ?
      AND (Q.queue_request_status = 'WAITING'
      OR Q.queue_request_status = 'IN_PROGRESS')
      ORDER BY Q.queue_timestamp;`,
      [user_id, course_id,]
    );
    await connection.end();
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
})
module.exports = router;