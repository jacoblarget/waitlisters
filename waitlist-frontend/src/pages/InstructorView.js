import React, { useEffect, useMemo, useState } from "react";
import Queue from "./subpages/Queue.js";
import "/app/src/App.css";
import { useParams } from "react-router-dom";

function InstructorView(props) {
    const baseURL = 'http://localhost:8080/instructor';
    const headers = ["Position","Name","Estimated Time","Query Description","Instructor"];
    const { user_id, course_id } = useParams();
    const [queueData, setQueueData] = useState("");
    const [isEditing, setIsEditing] = useState("");
    const [roomInfo, setRoomInfo] = useState("");
    const [currentlyHelpingStudent, setCurrentlyHelpingStudent] = useState("");

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

    const getRoomInfo = useMemo(() => async () => {
      const request = {user_id: user_id, course_id: course_id};
      const response = await get("getRoomInfo", request);
      if (!isEditing) setRoomInfo(response[0]["permission_location"]);
    }, [user_id, course_id, isEditing]);

    const getCurrentlyHelpingStudent = useMemo(() => async () => {
      const request = {user_id: user_id, course_id: course_id};
      const response = await get("getCurrentlyHelpingStudent", request);
      setCurrentlyHelpingStudent(response[0] === undefined ? undefined : response[0]["user_name"]);
    }, [user_id, course_id]);

    const getQueueStatus = useMemo(() => async () => {
      const request = {user_id: user_id, course_id: course_id};
      const response = await get("getQueueStatus", request);
      setQueueData(response);
    }, [user_id, course_id]);

    useEffect(() => {
      const interval = setInterval(() => {
        getQueueStatus();
        getRoomInfo();
        getCurrentlyHelpingStudent();
      }, 500); // in ms, refresh speed
      return () => clearInterval(interval); // clean unmount
    }, [user_id, course_id, get]);

    async function submitRoomInfo() {
        const request = { user_id: user_id, course_id: course_id, permission_location: roomInfo };
        const response = await post('setRoomInfo', request);
        setIsEditing(false);
    }
    
    async function takeNextStudent() {
        const request = { user_id: user_id, course_id: course_id };
        const response = await post('takeNextStudent', request);
        setCurrentlyHelpingStudent(response[0].user_id)
    }
    
    async function finishHelpingStudent() {
        const request = {user_id: user_id, course_id: course_id };
        const response = await post('finishHelpingStudent', request);
        setCurrentlyHelpingStudent(undefined);
    }
    
    async function removeNoShowStudent() {
        const request = { user_id: user_id, course_id: course_id };
        const response = await post('removeNoShowStudent', request);
        setCurrentlyHelpingStudent(undefined);
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
                            <p class="navbar-brand mb-0 h1">Welcome to your Instructor View for Course {course_id}, @{user_id}!</p>
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
                <div className="row m-3">
                    <div className="col-lg-6 mb-3 sticky-top">
                        <div className="card justify-content-center text-center">
                            <div className="card-body justify-content-center">
                                <div className="row justify-content-center text-center">
                                    <div className="col-lg-6">
                                        {isEditing ? (
                                            <>
                                                <div className="form-floating">
                                                    <input
                                                        className="form-control bottom-border w-150"
                                                        id="location"
                                                        type="text"
                                                        value={roomInfo}
                                                        onChange={
                                                            (event) => {
                                                                setRoomInfo(event.target.value);
                                                            }
                                                        }
                                                    />
                                                    <label
                                                        className="text-secondary disabled"
                                                        htmlFor="location"
                                                    >
                                                        Location
                                                    </label>
                                                    <button
                                                        className="btn btn-primary btn-sm mt-2 btn-modified"
                                                        onClick={submitRoomInfo}
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <h5 className="text-center mt-2">
                                                    Your Location:{" "}
                                                    <small className="text-muted">
                                                        {roomInfo}
                                                    </small>
                                                </h5>

                                                <button
                                                    className="btn btn-dark btn-sm mt-2 btn-modified"
                                                    onClick={() =>
                                                        setIsEditing(true)
                                                    }
                                                >
                                                    Edit Location
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="row justify-content-center text-center">
                                    <div className="col-lg-6">
                                        <button
                                            className="btn btn-sm btn-dark mt-2 btn-modified"
                                            hidden={!queueData.length || currentlyHelpingStudent}
                                            onClick={takeNextStudent}
                                        >
                                            Help Next Student
                                        </button>
                                        <button
                                            className="btn btn-sm btn-dark mt-2 btn-modified"
                                            hidden={!currentlyHelpingStudent}
                                            onClick={finishHelpingStudent}
                                        >
                                            Finish Helping {" " + currentlyHelpingStudent}
                                        </button>
                                        <button
                                            className="btn btn-sm btn-dark mt-2 btn-modified"
                                            hidden={!currentlyHelpingStudent}
                                            onClick={removeNoShowStudent}
                                        >
                                            Remove No Show from Queue
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-6 mb-2">
                        <div class="card">
                            <div class="card-body">
                                { queueData.length ? <Queue headers={headers} data={queueData}/>
                                            : <>No students? Check Piazza!</>
                                }
                                
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
export default InstructorView; // adds component to application
