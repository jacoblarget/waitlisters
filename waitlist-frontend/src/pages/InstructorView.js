import React, { useEffect, useState } from "react";
import InstructorTable from "./subpages/InstructorTable.js";
import "/app/src/App.css";
import { useParams } from "react-router-dom";

function InstructorView(props) {
    // component-wide variables
    // these won't change
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
    // these will change.
    const { user_id } = useParams();
    const { course_id } = useParams();
    const [state, setState] = useState({
        user_id: user_id,
        course_id: course_id,
        queueData: [],
        isEditing: false,
    });

    // state variables for the room info.
    const [roomInfo, setRoomInfo] = useState("");

    //state variable for currently helping student
    const [currentlyHelpingStudent, setCurrentlyHelpingStudent] = useState("");

    const handleRoomInfoChange = (event) => {
        setRoomInfo(event.target.value);
    };

    // ensure authenticated rendering
    useEffect(() => {
        const interval = setInterval(() => {
            getQueueStatus();
            getRoomInfo();
            getCurrentlyHelpingStudent();
        }, 500); // in ms, repeatedly call the database for changes
        return () => clearInterval(interval); // cleanup when component unmounts
    }, [
        user_id,
        course_id,
        getQueueStatus,
        getRoomInfo,
        getCurrentlyHelpingStudent,
    ]);

    // these functions handle user input handled on the back end
    async function submitRoomInfo() {
        const dataIn = { user_id, course_id, permission_location: roomInfo };
        postOptions["body"] = JSON.stringify(dataIn);
        const response = await fetch(
            `http://localhost:8080/instructor/setRoomInfo`,
            postOptions
        );
        if (!response.ok)
            throw new Error(
                `No error setting room info: ${response.statusText}`
            );
        setState({ ...state, isEditing: false });
    }

    async function getRoomInfo() {
        const dataIn = { user_id: user_id, course_id: course_id };
        const parameters = new URLSearchParams(dataIn).toString();
        const response = await fetch(
            `http://localhost:8080/instructor/getRoomInfo?${parameters}`
        );
        if (!response.ok)
            throw new Error(
                `Error getting queue status: ${response.statusText}`
            );
        const dataOut = await response.json();
        if (!state.isEditing) setRoomInfo(dataOut[0]["permission_location"]);
    }

    async function getCurrentlyHelpingStudent() {
        const dataIn = { user_id: user_id, course_id: course_id };
        const parameters = new URLSearchParams(dataIn).toString();
        const response = await fetch(
            `http://localhost:8080/instructor/getCurrentlyHelpingStudent?${parameters}`
        );
        if (!response.ok)
            throw new Error(
                `Error taking the next student: ${response.statusText}`
            );
        const dataOut = await response.json();
        setCurrentlyHelpingStudent(
            dataOut[0] === undefined ? "None" : dataOut[0]["user_name"]
        );
    }

    async function getQueueStatus() {
        const dataIn = { user_id: user_id, course_id: course_id };
        const parameters = new URLSearchParams(dataIn).toString();
        const response = await fetch(
            `http://localhost:8080/instructor/getQueueStatus?${parameters}`
        );
        if (!response.ok)
            throw new Error(
                `Error getting queue status: ${response.statusText}`
            );
        const dataOut = await response.json();
        setState({ ...state, queueData: dataOut });
    }
    async function takeNextStudent() {
        const dataIn = { user_id: user_id, course_id: course_id };
        postOptions["body"] = JSON.stringify(dataIn);
        const response = await fetch(
            `http://localhost:8080/instructor/takeNextStudent`,
            postOptions
        );
        if (!response.ok)
            throw new Error(
                `Error taking the next student: ${response.statusText}`
            );
        const { results, message } = await response.json();
        setState({ ...state, currentlyHelpingStudent: results[0].user_id });
    }
    async function finishHelpingStudent() {
        const dataIn = {};
        dataIn["user_id"] = state.user_id;
        dataIn["course_id"] = state.course_id;
        postOptions["body"] = JSON.stringify(dataIn);
        const response = await fetch(
            `http://localhost:8080/instructor/finishHelpingStudent`,
            postOptions
        );
        if (!response.ok)
            throw new Error(
                `Error in finishHelpingStudent, ${response.statusText}`
            );
        setCurrentlyHelpingStudent("None");
    }
    async function removeNoShowStudent() {
        const dataIn = {};
        dataIn["user_id"] = state.user_id;
        dataIn["course_id"] = state.course_id;
        postOptions["body"] = JSON.stringify(dataIn);
        const response = await fetch(
            `http://localhost:8080/instructor/removeNoShowStudent`,
            postOptions
        );
        if (!response.ok)
            throw new Error(
                `Error removing No Show Student: ${response.statusText}`
            );
        setCurrentlyHelpingStudent("None");
    }

    let tk = localStorage.getItem("token");

    if (parseInt(state.user_id) !== parseInt(tk)) {
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
                                href={"/dashboard/" + state.user_id}
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
                                        {state.isEditing ? (
                                            <>
                                                <div className="form-floating">
                                                    <input
                                                        className="form-control bottom-border w-150"
                                                        id="location"
                                                        type="text"
                                                        value={roomInfo}
                                                        onChange={
                                                            handleRoomInfoChange
                                                        }
                                                    />
                                                    <label
                                                        className="text-secondary disabled"
                                                        for="location"
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
                                                        setState({
                                                            ...state,
                                                            isEditing: true,
                                                        })
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
                                            onClick={takeNextStudent}
                                        >
                                            Help Next Student
                                        </button>
                                        <button
                                            className="btn btn-sm btn-dark mt-2 btn-modified"
                                            onClick={finishHelpingStudent}
                                        >
                                            Finish Helping{" "}
                                            {currentlyHelpingStudent}
                                        </button>
                                        <button
                                            className="btn btn-sm btn-dark mt-2 btn-modified"
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
                                <InstructorTable
                                    headers={headers}
                                    data={state.queueData}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
export default InstructorView; // adds component to the application
