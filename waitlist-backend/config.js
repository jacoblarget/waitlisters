const mysql = require('mysql2/promise');

const config = {
  host     : 'db',
  user     : 'root',
  password : 'password',
  database : 'waitlist'
};

/**
 * This function is to be used within a separate API call to ensure that a given user has the appropriate permissions
 * in a course, i.e. the user is an instructor or a student for the given course.
 * @param {*} user_id the user whose permissions we would like to check.
 * @param {*} course_id the course that we would like to check if the user is an instructor or student for.
 * @param {*} type species whether we want to check if the instructor is a student or an instructor.
 */
const checkPermissions = async (user_id, course_id, type) => {
  // check to make sure that the type parameter passed is valid.
  if (type !== 'INSTRUCTOR' && type !== 'STUDENT') throw new Error(
    'Invalid type parameter.'
  );

  // Query the Permissions table using the specified parameters.
  const connection = await mysql.createConnection(config);
  const sql = 'SELECT COUNT(*) FROM Permissions WHERE user_id = ? AND course_id = ? AND permission_type = ?';
  const [rows] = await connection.execute(sql, [user_id, course_id, type]);
  await connection.end();

  // If there isn't a permission found, return an error.
  if (rows[0]['COUNT(*)'] === 0) throw new Error(
    `User ${user_id} does not have ${type} permission for Course ${course_id}`
  );
};

module.exports = {config, checkPermissions};