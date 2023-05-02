import "../App.css";
import StudentWaitlist from "./subpages/StudentWaitlist.js";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";

//refactored version for functional
function StudentView({ useAuth }) {
    //Queue and API statics
    const headers = [
        "Position",
        "Name",
        "Estimated Time",
        "Query Description",
        "Instructor",
    ];
    const postOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const { user_id, course_id } = useParams();

    //State to track for queue
    const [state, setState] = useState({
        user_id: user_id,
        course_id: course_id,
        queueData: [],
        queue_time: "5",
        queue_topic_description: "",
        is_editing_estimated_time: false,
        is_editing_topic_description: false,
        instructorLocation: "Your Instructor's Room",
        instructor_id: "",
        mode: "ENTER", // other options, EXIT, SELECTED
    });

    //Grab queue status when rendered
    useEffect(() => {
        const interval = setInterval(() => {
            getQueueStatus();
            getEntryStatus();
        }, 500); // in ms, repeatedly call the database for changes
        return () => clearInterval(interval); // cleanup when component unmounts
    }, [user_id, course_id, getQueueStatus, getEntryStatus]);

    async function getQueueStatus() {
        const dataIn = {user_id: user_id, course_id: course_id};
        const parameters = new URLSearchParams(dataIn).toString();
        const response = await fetch(
            `http://localhost:8080/student/getQueueStatus?${parameters}`
        );
        if (!response.ok)
            throw new Error(
                `Error getting queue status: ${response.statusText}`
            );
        const dataOut = await response.json();
        setState(prevState => ({ ...prevState, queueData: dataOut }));
    }
    //Handles button functionality for entering the queue
    async function handleClickAdd() {
        const dataIn = {
            user_id: state.user_id,
            course_id: state.course_id,
            queue_estimated_time: state.queue_time,
            queue_topic_description: state.queue_topic_description
        };
        postOptions["body"] = JSON.stringify(dataIn);
        const response = await fetch(
            "http://localhost:8080/student/enqueue",
            postOptions
        );
        if (!response.ok)
            throw new Error(
                `Error adding student to waitlist: ${response.statusText}`
            );
    }

    //Handles button functionality for exiting the queue
    async function handleClickLeave() {
        console.log("Leaving");
        const dataIn = {
            user_id: user_id, course_id: course_id
        };
        postOptions["body"] = JSON.stringify(dataIn);
        const response = await fetch(
            "http://localhost:8080/student/exitQueue",
            postOptions
        );
        if (!response.ok)
            throw new Error(
                `Error adding student to waitlist: ${response.statusText}`
            );
    }

    // copied from instructor view with a few changes @TODO
    async function getRoomInfo(instructor_id) {
        const dataIn = { user_id: instructor_id, course_id: course_id };
        const parameters = new URLSearchParams(dataIn).toString();
        const response = await fetch(
            `http://localhost:8080/instructor/getRoomInfo?${parameters}`
        );
        if (!response.ok)
            throw new Error(
                `Error getting queue status: ${response.statusText}`
            );
        const dataOut = await response.json();
        setState(prevState => ({
            ...prevState,
            instructorLocation: dataOut[0]["permission_location"]
        }));
    }

    // updates button components from current database values
    async function getEntryStatus() {
        const dataIn = {user_id, course_id};
        const parameters = new URLSearchParams(dataIn).toString();
        const response = await fetch(
            `http://localhost:8080/student/getEntryStatus?${parameters}`
        );
        if (!response.ok) {
            console.error("Error checking entry status: ", response.statusText);
            return;
        }
        const results = await response.json();
        let newMode = "ENTER";
        if(!results[0]) {
            setState(prevState => ({
                ...prevState,
                mode: newMode
            }));
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
        setState(prevState => ({
            ...prevState,
            mode: newMode
        }));
    }

    let tk = localStorage.getItem("token");

    if (parseInt(state.user_id) !== parseInt(tk)) {
        return <>You are not allowed to view this page.</>;
    } else {
        //Functional version of Render() --- Spits out what the page should look like. 
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
                                href={"/dashboard/" + state.user_id}
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
                                        {state.is_editing_estimated_time ? (
                                            <>
                                                <div className="form-floating">
                                                    <input
                                                        className="form-control bottom-border w-150"
                                                        type="text"
                                                        id="changeTime"
                                                        value={state.queue_time}
                                                        onChange={(e) =>
                                                            setState({
                                                                ...state,
                                                                queue_time:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                    <label
                                                        className="text-secondary disabled"
                                                        for="changeTime"
                                                    >
                                                        Time Needed
                                                    </label>

                                                    <button
                                                        className="btn btn-primary btn-sm mt-1 mb-2 btn-modified"
                                                        hidden={
                                                            state.mode !==
                                                            "ENTER"
                                                        }
                                                        onClick={() =>
                                                            setState({
                                                                ...state,
                                                                is_editing_estimated_time: false,
                                                            })
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
                                                        state.mode !== "ENTER"
                                                    }
                                                >
                                                    Time Needed:{" "}
                                                    <small className="text-muted">
                                                        {state.queue_time}{" "}
                                                        minutes
                                                    </small>
                                                </h5>
                                                <button
                                                    className="btn btn-dark btn-sm mt-1 mb-2 btn-modified"
                                                    hidden={
                                                        state.mode !== "ENTER"
                                                    }
                                                    onClick={() =>
                                                        setState({
                                                            ...state,
                                                            is_editing_estimated_time: true,
                                                        })
                                                    }
                                                >
                                                    Edit Time Needed
                                                </button>
                                            </>
                                        )}
                                        {state.is_editing_topic_description ? (
                                            <>
                                                <div className="form-floating">
                                                    <input
                                                        className="form-control bottom-border w-150 mt-2"
                                                        type="text"
                                                        id="changeDesc"
                                                        maxLength="120"
                                                        value={
                                                            state.queue_topic_description
                                                        }
                                                        onChange={(e) =>
                                                            setState({
                                                                ...state,
                                                                queue_topic_description:
                                                                    e.target
                                                                        .value,
                                                            })
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
                                                            state.mode !==
                                                            "ENTER"
                                                        }
                                                        onClick={() =>
                                                            setState({
                                                                ...state,
                                                                is_editing_topic_description: false,
                                                            })
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
                                                        state.mode !== "ENTER"
                                                    }
                                                >
                                                    Your Question:{" "}
                                                    <small className="text-muted">
                                                        {
                                                            state.queue_topic_description
                                                        }
                                                    </small>
                                                </h5>
                                                <button
                                                    className="btn btn-dark btn-sm mt-1 mb-2 btn-modified"
                                                    hidden={
                                                        state.mode !== "ENTER"
                                                    }
                                                    onClick={() =>
                                                        setState({
                                                            ...state,
                                                            is_editing_topic_description: true,
                                                        })
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
                                                    onClick={handleClickAdd}
                                                    hidden={
                                                        state.mode !== "ENTER"
                                                    }
                                                >
                                                    {"Enter Waitlist"}
                                                </button>
                                                <button
                                                    className="btn btn-dark btn-sm mt-2 btn-modified"
                                                    id={"leave"}
                                                    title={"Leave Waitlist"}
                                                    onClick={handleClickLeave}
                                                    hidden={
                                                        state.mode !== "EXIT"
                                                    }
                                                >
                                                    {"Leave Waitlist"}
                                                </button>
                                                { <p hidden={state.mode !== "SELECTED"}>You've been selected! Head to {state.instructorLocation}</p> }
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
                                <StudentWaitlist
                                    headers={headers}
                                    data={state.queueData}
                                ></StudentWaitlist>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default StudentView; // This allows for the use of the StudentView component to be used in other JS files, particularly in other pages or in App.js for launch. Still requires an import into corresponding JS file.
