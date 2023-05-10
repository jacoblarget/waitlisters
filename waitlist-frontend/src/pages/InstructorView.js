import React, { useEffect, useState } from "react";
import Queue from "./subpages/Queue.js";
import "/app/src/index.css";
import { useParams } from "react-router-dom";
import { get, post } from "../api";


function InstructorView() {

  // component-wide variables
  const instructorBaseURL = 'http://localhost:8080/instructor';
  const headers = ["Position","Name","Estimated Time","Query Description","Instructor"];
  const { user_id, course_id } = useParams();
  const [queueData, setQueueData] = useState([]);
  const [isEditing, setIsEditing] = useState("");
  const [roomInfo, setRoomInfo] = useState("");
  const [currentlyHelpingStudent, setCurrentlyHelpingStudent] = useState("");

  // automatic rendering
  useEffect(() => {
    const interval = setInterval(async () => {
      const request = {user_id: user_id, course_id: course_id};
      const [queueResponse, roomResponse, studentResponse] = await Promise.all([
        get("getQueueStatus", request, instructorBaseURL),
        get("getRoomInfo", request, instructorBaseURL),
        get("getCurrentlyHelpingStudent", request, instructorBaseURL)
      ]);
      setQueueData(queueResponse);
      if (!isEditing) setRoomInfo(roomResponse[0]["permission_location"]);
      setCurrentlyHelpingStudent(studentResponse[0] === undefined ? undefined : studentResponse[0]["user_name"]);
    }, 500); // in ms, refresh speed
    return () => clearInterval(interval); // clean unmount
  }, [user_id, course_id, isEditing]);

  async function submitRoomInfo() {
    const request = { user_id: user_id, course_id: course_id, permission_location: roomInfo };
    await post('setRoomInfo', request, instructorBaseURL);
    setIsEditing(false);
  }
  
  async function takeNextStudent() {
    const request = { user_id: user_id, course_id: course_id };
    const response = await post('takeNextStudent', request, instructorBaseURL);
    setCurrentlyHelpingStudent(response[0].user_id)
  }
    
  async function finishHelpingStudent() {
    const request = {user_id: user_id, course_id: course_id };
    await post('finishHelpingStudent', request, instructorBaseURL);
    setCurrentlyHelpingStudent(undefined);
  }
    
  async function removeNoShowStudent() {
    const request = { user_id: user_id, course_id: course_id };
    await post('removeNoShowStudent', request, instructorBaseURL);
    setCurrentlyHelpingStudent(undefined);
  }

  // shows minimal page if invalid token
  let tk = localStorage.getItem("token");
  if (parseInt(user_id) !== parseInt(tk)) return(<>You are not allowed to view this page.</>);
  
  // real page if valid token
  return(<>
    <section id="title bg-success">
      <nav class="navbar navbar-dark bg-dark justify-content-between">
      <a class="navbar-brand" href="/">FIFO</a>
      <div class="container-fluid col">
      <p class="navbar-brand mb-0 h1">Welcome to your Instructor View for Course {course_id}, @{user_id}!</p>
      </div>
    <div className="col-lg-3 text-end">
      <a class="btn btn-outline-light btn-lg px-2 mx-2 my-2 my-sm-0" href={"/dashboard/" + user_id}>
        Back to Dashboard
      </a>
    </div>
  </nav>
</section>
<div className="row m-3">
  <div className="col-lg-6 mb-3 sticky-top">
    <div className="card justify-content-center text-center">
      <div className="card-body justify-content-center">
        <div className="row justify-content-center text-center">
          <div className="col-lg-6">
              <div hidden={!isEditing} className="form-floating">
                <input className="form-control bottom-border w-150" id="location" type="text" value={roomInfo} onChange={(event) => {setRoomInfo(event.target.value);}}/>
                <label className="text-secondary disabled" htmlFor="location">Location</label>
                <button className="btn btn-primary btn-sm mt-2 btn-modified" onClick={submitRoomInfo}>Save</button>
              </div>
              <div hidden={isEditing}>
                <h5 className="text-center mt-2">Your Location: <small className="text-muted">{roomInfo}</small></h5>
                <button className="btn btn-dark btn-sm mt-2 btn-modified" onClick={() => setIsEditing(true)}>Edit Location</button>
              </div>
          </div>
        </div>
        <div className="row justify-content-center text-center">
          <div className="col-lg-6">
            <button hidden={!queueData.length || currentlyHelpingStudent} className="btn btn-sm btn-dark mt-2 btn-modified" onClick={takeNextStudent}>Help Next Student</button>
            <button  hidden={!currentlyHelpingStudent} className="btn btn-sm btn-dark mt-2 btn-modified" onClick={finishHelpingStudent}>Finish Helping {" " + currentlyHelpingStudent}</button>
            <button hidden={!currentlyHelpingStudent} className="btn btn-sm btn-dark mt-2 btn-modified" onClick={removeNoShowStudent}>Remove No Show from Queue</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-lg-6 mb-2">
    <div class="card">
      <div hidden={!queueData.length} class="card-body">
       <Queue headers={headers} data={queueData}/>
      </div>
      <div hidden={queueData.length}>
        <>No students? Check Piazza!</>
      </div>
    </div>
  </div>
</div>
</>);
}
export default InstructorView; // adds component to application
