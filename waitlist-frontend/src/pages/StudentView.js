import "../App.css";
import Queue from "./subpages/Queue";
import { useParams } from "react-router-dom";
import React, { useEffect, useState} from "react";
import { get, post } from "../api";

function StudentView() {
  // globals
  const studentBaseURL = 'http://localhost:8080/student';
  const instructorBaseURL = 'http://localhost:8080/instructor';
  const headers = [ "Position", "Name", "Estimated Time", "Query Description", "Instructor"];
  const { user_id, course_id } = useParams();
  const [queueData, setQueueData] = useState([]);
  const [queue_time, setQueueTime] = useState("");
  const [queue_topic_description, setQueueTopicDescription] = useState("");
  const [instructorLocation, setInstructorLocation] = useState("");
  const [mode, setMode] = useState("ENTER");

  // automatic rendering
  useEffect(() => {
    const interval = setInterval(async () => {
      const request = {user_id, course_id}
      const [queueStatus, entryStatus] = await Promise.all([
        get("getQueueStatus", request, studentBaseURL),
        get("getEntryStatus", request, studentBaseURL)
      ]);
      setQueueData(queueStatus);
      if (!entryStatus[0]) {
        setMode("ENTER");
        return;
      }
      const userPresent = entryStatus[0].user_id !== null;
      const instructorSelected = entryStatus[0].instructor_id !== null;
      if (userPresent && instructorSelected) {
        const instructor_id = entryStatus[0].instructor_id;
        const request = {user_id: instructor_id, course_id: course_id};
        const response = await get("getRoomInfo", request, instructorBaseURL);
        setInstructorLocation(response[0]["permission_location"]);
        setMode("SELECTED");
      } else {
        setMode("EXIT");
      }
    }, 500); // in ms, refresh speed
    return () => clearInterval(interval); // clean unmount
  }, [user_id, course_id]);

  async function enqueue() {
    const request = {user_id: user_id, course_id: course_id,
      queue_estimated_time: queue_time || 5, // set default
      queue_topic_description: queue_topic_description};
    await post('enqueue', request, studentBaseURL);
  }
  async function exitQueue(){
    const request = {user_id, course_id};
    await post('exitQueue', request, studentBaseURL);
  }

  let tk = localStorage.getItem("token");

  if (parseInt(user_id) !== parseInt(tk)) return <>You are not allowed to view this page.</>;
  return(<>
  <section id="title" class="bg-success">
    <nav class="navbar navbar-dark bg-dark justify-content-between">
      <a className="navbar-brand" href="/">FIFO</a>
      <div class="col">
        <p class="navbar-brand mb-0 h1 text-center">Welcome to your Student View for Course {course_id}, @{user_id}!</p>
      </div>
      <div class="col-lg-3 text-end">
        <a class="btn btn-outline-light btn-lg px-2 mx-2 my-2 my-sm-0" href={"/dashboard/" + user_id}>Back to Dashboard</a>
      </div>
    </nav>
  </section>

  <div class="row m-3">
    <div class="col-lg-6 mb-3 sticky-top">
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-center align-items-center mb-3">
            <div class="w-50">
              <div class="mb-3" hidden={mode !== 'ENTER'}>
                <input class="form-control bottom-border" placeholder={headers[2]} type="number" id="changeTime" value={queue_time} onChange={(e) => setQueueTime(e.target.value)} />
                <input class="form-control bottom-border" placeholder={headers[3]} type="text" id="changeDesc" maxLength="120" value={queue_topic_description} onChange={(e) => setQueueTopicDescription(e.target.value)} />
              </div>
              <div class="d-flex justify-content-center align-items-center">
                <div class="w-75">
                  <button class="btn btn-dark btn-sm btn-block mt-2 btn-modified" onClick={enqueue} hidden={mode !== "ENTER"}>Enter Waitlist</button>
                  <button class="btn btn-dark btn-sm btn-block mt-2 btn-modified" onClick={exitQueue} hidden={mode !== "EXIT"}>Leave Waitlist</button>
                  <p class="text-center mt-2" hidden={mode !== "SELECTED"}>You've been selected! Head to {instructorLocation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-lg-6 mb-2">
      <div class="card">
        <div class="card-body">
          {queueData.length ? <Queue headers={headers} data = {queueData}/> : <>You'll be the first!</>}
      </div>
  </div>
  </div>
  </div>
  </>);
}
export default StudentView; // adds component to application