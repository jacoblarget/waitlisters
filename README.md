# Waitlisters

Our web application, called Waitlisters, is designed to help college students and instructors organize office hours queues efficiently. It helps students view estimated wait times for help in the courses that they are enrolled in. Moreover, it allows instructors to manage students desiring help in the course that they are teaching. Additional features include  notifying students in real-time of their status on the queue.

It is available for use at TODO.

Technical details are listed below for those interested in adapting/analyzing the code structure.

## Crediting

This code relies on the work of the larger open-source development community. We want to especially thank the developers of Docker, GitHub, OpenAI, Bootstrap, React, NodeJS, and MySQL for their efforts.

### Sources

* https://www.tutorialrepublic.com/codelab.php?topic=bootstrap&file=card-with-tabs-navigation


## UX Details

See screenshots (TODO)

## API Calls

### Student Route

#### `POST: student/enqueue`:
Parameters: user_id, course_id,  queue_estimated_time, queue_topic_description

Backend/DB actions:
* Check the permissions table with the user_id and course_id to make sure that this user is a student in this course.
* Add user to queue with new queue_id (new row in queue table), where queue_request_status will be set to “WAITING”, and information from API call is saved in the entry (user_id, course_id,  queue_estimated_time, queue_topic_description)

#### `POST: student/exitQueue`:
Parameters: user_id, course_id

Backend/DB actions: 
* Check the permissions table with the user_id and course_id to make sure that this 
user is a student in this course.
* For the entry (row) in the Queue table with the matching user_id 
and course_id, set the queue_request_status to “CANCELED”

TODO complete formatting

GET: student/getQueueStatus:
	Parameters: user_id, course_id
	Backend/DB actions: 
		Check the permissions table with the user_id and course_id to make sure that this 
user is a student in this course. If so, return the entries in the Queue table that have a matching 
course_id and have a queue_request_status of “WAITING”. Sort the entries by the 
queue_timestamp field. Join with the student table to receive the student name based on the 
user_id. The final result should have user_name, queue_estimated_time, and 
queue_topic_description for each user in the queue.

Instructor Route:
GET: instructor/getQueueStatus:
	Parameters: user_id, course_id
	Backend/DB actions: 
		Check the permissions table with the user_id and course_id to make sure that this 
user is a instructor in this course. If so, return the entries in the Queue table that have a matching 
course_id and have a queue_request_status of “WAITING”. Sort the entries by the 
queue_timestamp field. Join with the student table to receive the student name based on the 
user_id. The final result should have queue_id, user_name, queue_estimated_time, and 
queue_topic_description for each user in the queue.

POST: instructor/takeNextStudent:
	Parameters: user_id, course_id
Backend/DB actions: 
	Check the permissions table with the user_id and course_id to make sure that this 
user is a instructor in this course. Then, find the next person on the queue (select top 1 from queue 
table with matching course_id filter by least recent helped where queue_request_status is 
“Waiting”). Update this entry to the queue so that queue_request_status is “IN_PROGRESS” and 
the queue_instructor_user_id is set to the user_id of the instructor that made this request.

POST: instructor/finishHelpingStudent:
	Parameters: user_id, course_id
Backend/DB actions: 
	Check the permissions table with the user_id and course_id to make sure that this 
user is a instructor in this course.  Find the user that this instructor is currently helping by 
searching the Queue table for an entry where queue_request_status is “IN_PROGRESS” and the 
queue_instructor_user_id is the user_id of the instructor making the request. Update this entry to 
the queue so that queue_request_status is “DONE”.

POST: instructor/removeNoShowStudent:
	Parameters: user_id, course_id
Backend/DB actions: 
	Check the permissions table with the user_id and course_id to make sure that this 
user is an instructor in this course.  Find the user that this instructor is currently helping by 
searching the Queue table for an entry where queue_request_status is “IN_PROGRESS” and the 
queue_instructor_user_id is the user_id of the instructor making the request. Update this entry to 
the queue so that queue_request_status is “CANCELED”.

POST: instructor/setRoomInfo:
	Parameters: user_id, course_id, permission_location
Backend/DB actions: 
	Check the permissions table with the user_id and course_id to make sure that this 
user is an instructor in this course.  Update this entry (row) of the permissions table, setting 
permission_location field to the value passed into the API call.

GET: instructor/getRoomInfo:
	Parameters: user_id, course_id
Backend/DB actions: 
	Check the permissions table with the user_id and course_id to make sure that this 
user is an instructor in this course.  Return the permission_location field from the 
permissions table for the matching entry with the appropriate user_id and course_id. 

GET: instructor/getCurrentlyHelpingStudent:
	Parameters: user_id, course_id
	Backend/DB actions: 
		Check the permissions table with the user_id and course_id to make sure that this 
user is an instructor in this course. Find the user that this instructor is currently helping by 
searching the Queue table for an entry where queue_request_status is “IN_PROGRESS” and the 
queue_instructor_user_id is the user_id of the instructor making the request. Join with the user 
table based on the user_id of the student in this queue slot, and return this student’s name. Also 
return queue_topic_description and queue_estimated_time for this row in the queue.

Account:
POST: AccountCreateAccount:
	Parameters: wisc.edu email, password, name
	Backend/DB actions: 
		Check the user table to see if there is already an account for the email address supplied. If there is, 
return a 409 (front end should then prompt the user to sign-in). Otherwise, create a new row in 
the user table with the corresponding name, email, and password from the parameters. 

GET: AccountSignIn:
	Parameters: wisc.edu email, password
	Backend/DB actions: 
		Check the user table to see if there is already an account for the email address and password 
supplied. If there isn’t, return a 409 (front end should then say incorrect password). Finally, return the User_id for this user

Dashboard:
POST: CreateCourse:
	Parameters: user_id, course_name, course_description
	Backend/DB actions: 
Create a new course (row) in the Course table using the course_name and course_description from the parameters. The student and instructor join codes should each be sudo-randomly generated 6 character alpha-numeric codes with the course_id appended to ensure 1-1 mapping from join code to course_id.

Using the course_id for the newly created course, add a new row to the permissions table such that the user that is creating the course is an instructor for that course. In other words, the SQL should look something like:
INSERT INTO permissions (course_id, user_id, permission_type, permission_location) VALUES (course_id_from_newly created_course, user_id_of_user_who_made_this_request_from_api_parameters, “INSTRUCTOR”,NULL). 
Return the course_id for the newly created course to the frontend.

GET: GetCourseJoinCodes:
	Parameters: user_id, course_id
	Backend/DB actions: 
Check the permissions table with the user_id and course_id to make sure that this user is an instructor in the course specified by the course_id. Then run a select query in the Courses database to return the course_student_join_code and course_instructor_join_code.

POST: JoinExistingCourseAsInstructor:
	Parameters: user_id, course_name, course_instructor_join_code
	Backend/DB actions: 
Check if the course_instructor_join_code exists in the course table. If so, pull the course_id from the course table corresponding to this row.

Using the course_id for the course, add a new row to the permissions table such that the user making the request  is an instructor for that course. In other words, the SQL should look something like:
INSERT INTO permissions (course_id, user_id, permission_type, permission_location) VALUES (course_id_from_step1, user_id_of_user_who_made_this_request_from_api_parameters, “INSTRUCTOR”,NULL) 

POST: JoinExistingCourseAsStudent:
	Parameters: user_id, course_student_join_code
	Backend/DB actions: 
Check if the course_student_join_codeexists in the course table. If so, pull the course_id from the course table corresponding to this row.

Using the course_id for the course, add a new row to the permissions table such that the user making the request  is a student for that course. In other words, the SQL should look something like:
INSERT INTO permissions (course_id, user_id, permission_type, permission_location) VALUES (course_id_from_step1, user_id_of_user_who_made_this_request_from_api_parameters, “STUDENT”,NULL) 

GET: GetCoursesEnrolledAsStudent
	Parameters: user_id
	Backend/DB actions: 
Check if the user table to see if this user exists. If so, return a select query on the permissions table filtering by matching user_id from parameter list and permission_type = “STUDENT”. Join with the course table on course_id to get the name of each course. The final result returned should be a list of course_id, course_name pairs. E.g. in json
[
{course_id: 1234, course_name: “Algorithms”},
{course_id: 5678, course_name: “Data Structures”}
]

GET: GetCoursesEnrolledAsInstructor
	Parameters: user_id
	Backend/DB actions: 
Check if the user table to see if this user exists. If so, return a select query on the permissions table filtering by matching user_id from parameter list and permission_type = “INSTRUCTOR”. Join with the course table on course_id to get the name of each course. The final result returned should be a list of course_id, course_name pairs. E.g. in json
[
{course_id: 1234, course_name: “Algorithms”},
{course_id: 5678, course_name: “Data Structures”}
]

## Database Schema

See screenshots and table (TODO).

## Security Considerations

We will use a .env file to hide the secrets needed to connect to our database, and OAuth through Google's services to attempt to mitigate unwelcome visitors. TODO.




