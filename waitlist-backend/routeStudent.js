//Imports
var express = require('express');
var router = express.Router();
const {connect, checkPermissions} = require('./config');

router.post('/enterQueue', async (req, res) => {
    try {
      console.log('POST/enterQueue');
      const {user_id, course_id, queue_estimated_time, queue_topic_description} = req.body;
      await checkPermissions(user_id, course_id, 'STUDENT');
      const [results] = await connect(
        `INSERT INTO Queues (user_id, course_id, queue_estimated_time, queue_topic_description, queue_request_status)
        VALUES (?, ?, ?, ?, 'WAITING')`,
        [user_id, course_id, queue_estimated_time, queue_topic_description]
      );
      res.status(200).send(results);
    } catch (err) {
      res.status(500).send(err.message);
    }
});

router.post('/exitQueue', async (req, res) => {
    try {
      console.log('POST/exitQueue');
      const {user_id, course_id} = req.body;
      await checkPermissions(user_id, course_id, 'STUDENT');
      const [results] = await connect(
        `UPDATE Queues SET queue_request_status = 'CANCELED' 
        WHERE user_id = ? AND course_id = ? AND queue_request_status = 'WAITING'`,
        [user_id, course_id]
      );
      res.status(200).send(results);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  });

 router.get('/getQueueStatus', async (req, res) => {
  try {
    const {user_id, course_id} = req.query;
    await checkPermissions(user_id, course_id, 'STUDENT');
    const [results] = await connect(
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
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/getEntryStatus', async (req,res) =>{
  try {
    const {user_id, course_id} = req.query;
    await checkPermissions(user_id, course_id, 'STUDENT');
    const [results] = await connect(
      `SELECT U.user_id, Q.queue_instructor_user_id AS instructor_id
      FROM Queues Q
      JOIN Users U
      ON Q.user_id = U.user_id 
      WHERE Q.user_id = ?
      AND Q.course_id = ?
      AND (Q.queue_request_status = 'WAITING'
      OR Q.queue_request_status = 'IN_PROGRESS')
      ORDER BY Q.queue_timestamp;`,
      [user_id, course_id]
    );
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
})
module.exports = router;