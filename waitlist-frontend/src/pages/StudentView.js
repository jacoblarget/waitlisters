import "../App.css";
import Queue from "./subpages/Queue";
import { useParams } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";

function StudentView({ useAuth }) {
    const baseURL = 'http://localhost:8080/student';
    const headers = ["Position","Name","Estimated Time","Query Description","Instructor"];
    const { user_id, course_id } = useParams();
    const [queueData, setQueueData] = useState([]);
    const [queue_time, setQueueTime] = useState("5");
    const [queue_topic_description, setQueueTopicDescription] = useState("");
    const [is_editing_estimated_time, setIsEditingEstimatedTime] = useState(false);
    const [is_editing_topic_description, setIsEditingTopicDescription] = useState(false);
    const [instructorLocation, setInstructorLocation] = useState("Your Instructor's Room");
    const [mode, setMode] = useState("ENTER"); // other options EXIT, SELECTED

    const get = async (endpoint, request) => {
        const parameters = new URLSearchParams(request).toString();
        const response = await fetch(`${baseURL}/${endpoint}?${parameters}`);
        if (!response.ok) throw new Error(`Error getting ${endpoint}: ${response.statusText}`);
        return await response.json();
      }
  
      const post = async (endpoint, request) => {
          const postOptions = { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request)};
          const response = await fetch(`${baseURL}/${endpoint}`, postOptions);
          if (!response.ok) throw new Error(`Error posting ${endpoint}: ${response.statusText}`);
          return await response.json();
      }

    useEffect(() => {
        const interval = setInterval(() => {
            getQueueStatus();
            getEntryStatus();
        }, 500); // in ms, refresh speed
        return () => clearInterval(interval); // clean unmount
    }, [user_id, course_id, get]);

    const getQueueStatus = useMemo(() => async () => {
        const request = {user_id: user_id, course_id: course_id};
        const response = await get("getQueueStatus", request);
        setQueueData(response);
      }, [user_id, course_id]);
    async function enqueue() {
        const request = {user_id: user_id, course_id: course_id, queue_estimated_time: queue_time, queue_topic_description: queue_topic_description};
        const response = await post('enqueue', request);
    }
    async function exitQueue(){
        const request = {user_id, course_id};
        const response = await post('exitQueue', request);
    }
    async function getRoomInfo(instructor_id) {
        const request = {user_id: instructor_id, course_id: course_id};
        const response = await get("getRoomInfo", request);
        console.log(response);
        setInstructorLocation(response[0]["permission_location"]);
    }

    async function getEntryStatus() {
        const request = {user_id, course_id};
        const results = await get("getEntryStatus", request);
        let newMode = "ENTER";
        if(!results[0]) {
            setMode(newMode);
            return;
        }
        const userPresent = results[0].hasOwnProperty("user_id");
        const instructorSelected = results[0]["instructor_id"] !== null;
        if(userPresent){
            if(instructorSelected){
              newMode = "SELECTED";
              const instructor_id = results[0]["instructor_id"];
              getRoomInfo(instructor_id);
            }
            else{
              newMode = "EXIT";
            }
        }
        else{
        newMode = "ENTER";
        }
       setMode(newMode);
    }  

    let tk = localStorage.getItem("token");

    if (parseInt(user_id) !== parseInt(tk)) {
        return <>You are not allowed to view this page.</>;
    } else {
        return (
            <>
                <section id="title bg-success">
                    <nav class="navbar navbar-dark bg-dark justify-content-between">
                        <a class="navbar-brand" href="/">
                            FIFO
                        </a>
                        <div class="container-fluid col">
                            <p class="navbar-brand mb-0 h1">Welcome to your Student View for Course {course_id}, @{user_id}</p>
                        </div>
                        <div className="col-lg-3 text-end">
                            <a
                                class="btn btn-outline-light btn-lg px-2 mx-2 my-2 my-sm-0"
                                href={"/dashboard/" + user_id}
                            >
                                Back to Dashboard
                            </a>
                        </div>
                    </nav>
                </section>
                <div class="row m-3">
                    <div className="col-lg-6 mb-3 sticky-top">
                        <div className="card justify-content-center text-center">
                            <div className="card-body justify-content-center text-center">
                                <div className="row justify-content-center text-center">
                                    <div className="col-lg-6">
                                        {is_editing_estimated_time ? (
                                            <>
                                                <div className="form-floating">
                                                    <input
                                                        className="form-control bottom-border w-150"
                                                        type="text"
                                                        id="changeTime"
                                                        value={queue_time}
                                                        onChange={(e) => setQueueTime(e.target.value)}
                                                    />
                                                    <label
                                                        className="text-secondary disabled"
                                                        htmlFor="changeTime"
                                                    >
                                                        Time Needed
                                                    </label>

                                                    <button
                                                        className="btn btn-primary btn-sm mt-1 mb-2 btn-modified"
                                                        hidden={
                                                            mode !==
                                                            "ENTER"
                                                        }
                                                        onClick={() =>
                                                            setIsEditingEstimatedTime(false)
                                                        }
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <h5
                                                    className="text-center mt-2"
                                                    hidden={
                                                        mode !== "ENTER"
                                                    }
                                                >
                                                    Time Needed:{" "}
                                                    <small className="text-muted">
                                                        {queue_time + " "}
                                                        minutes
                                                    </small>
                                                </h5>
                                                <button
                                                    className="btn btn-dark btn-sm mt-1 mb-2 btn-modified"
                                                    hidden={
                                                        mode !== "ENTER"
                                                    }
                                                    onClick={() =>
                                                        setIsEditingEstimatedTime(true)
                                                    }
                                                >
                                                    Edit Time Needed
                                                </button>
                                            </>
                                        )}
                                        {is_editing_topic_description ? (
                                            <>
                                                <div className="form-floating">
                                                    <input
                                                        className="form-control bottom-border w-150 mt-2"
                                                        type="text"
                                                        id="changeDesc"
                                                        maxLength="120"
                                                        value={
                                                            queue_topic_description
                                                        }
                                                        onChange={(e) =>
                                                            setQueueTopicDescription(e.target.value)
                                                        }
                                                    />
                                                    <label
                                                        className="text-secondary disabled"
                                                        for="changeTime"
                                                    >
                                                        Question
                                                    </label>
                                                    <button
                                                        className="btn btn-primary btn-sm mt-1 mb-1 btn-modified"
                                                        hidden={
                                                            mode !==
                                                            "ENTER"
                                                        }
                                                        onClick={() =>
                                                            setIsEditingTopicDescription(false)
                                                        }
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <h5
                                                    className="text-center mt-2"
                                                    hidden={
                                                        mode !== "ENTER"
                                                    }
                                                >
                                                    Your Question:{" "}
                                                    <small className="text-muted">
                                                        {
                                                            queue_topic_description
                                                        }
                                                    </small>
                                                </h5>
                                                <button
                                                    className="btn btn-dark btn-sm mt-1 mb-2 btn-modified"
                                                    hidden={
                                                        mode !== "ENTER"
                                                    }
                                                    onClick={() =>
                                                        setIsEditingTopicDescription(true)
                                                    }
                                                >
                                                    Add Question Description
                                                </button>
                                            </>
                                        )}
                                        <div className="row justify-content-center text-center">
                                            <div className="col-lg-6">
                                                <button
                                                    className="btn btn-dark btn-sm mt-2 btn-modified"
                                                    id={"enter"}
                                                    title={"Enter Waitlist"}
                                                    onClick={enqueue}
                                                    hidden={
                                                        mode !== "ENTER"
                                                    }
                                                >
                                                    {"Enter Waitlist"}
                                                </button>
                                                <button
                                                    className="btn btn-dark btn-sm mt-2 btn-modified"
                                                    id={"leave"}
                                                    title={"Leave Waitlist"}
                                                    onClick={exitQueue}
                                                    hidden={
                                                        mode !== "EXIT"
                                                        // false
                                                    }
                                                >
                                                    {"Leave Waitlist"}
                                                </button>
                                                { <p hidden={mode !== "SELECTED"}>You've been selected! Head to {instructorLocation}</p> }
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
                                {queueData.length ? <Queue headers={headers} data={queueData}/>
                                : <>You'll be the first!</>
                                }        
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default StudentView; // adds component to application
