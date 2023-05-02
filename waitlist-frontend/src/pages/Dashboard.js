import "/app/src/App.css";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Homepage from "./Homepage";

/**
 * This function returns the HTML output for the dashboard page
 * @param {*} auth used for authentication
 * @returns HTML output for browser.
 */
function Dashboard({ setToken, useAuth }) {
    const { user_id } = useParams();
    const [state, setState] = useState({
        user_id: user_id,
    });

    // state variables for instructor and student course lists.
    const [instructor_course_list, setInstructorCourseList] = useState([]);
    const [student_course_list, setStudentCourseList] = useState([]);

    // state variables for the text box entry for create course
    const [course_name, setCourseName] = useState("");
    const [course_description, setCourseDescription] = useState("");
    const [editing_create_course, setEditingCreateCourse] = useState(false);

    // state variables for the text box entry for student join course.
    const [course_student_join_code, setStudentJoinCode] = useState("");
    const [editing_student_join_codee, setEditingStudentJoinCode] =
        useState(false);

    // state variables for the text box entry for instructor join course.
    const [course_instructor_join_code, setInstructorJoinCode] = useState("");
    const [editing_instructor_join_code, setEditingInstructorJoinCode] = useState(false);

    // state variables for the resulting join codes after creating a course.
    const [display_join_codes_after_create, setDisplayJoinCodesAfterCreate] = useState(false);
    const [output_instructor_join_code, setOutputInstructorJoinCode] = useState("");
    const [output_student_join_code, setOutputStudentJoinCode] = useState("");

    // used when sending a post request.
    const postOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    // updates state variables related to the text boxes for creating courses.
    const handleCourseNameChange = (event) => {
        setCourseName(event.target.value);
    };
    const handleCourseDescriptionChange = (event) => {
        setCourseDescription(event.target.value);
    };
    const handleEditingCreateCourse = (event) => {
        // clear out the join codes if needed
        if (editing_create_course){
            setDisplayJoinCodesAfterCreate(false);
        }
        
        // reverse value.
        setEditingCreateCourse(!editing_create_course);
    };

    // updates state variables related to the text boxes for adding courses as student
    const handleStudentJoinCodeChange = (event) => {
        setStudentJoinCode(event.target.value);
    };
    const handleEditingStudentJoinCode = (event) => {
        setEditingStudentJoinCode(!editing_student_join_codee);
    };

    // updates state variables related to the text boxes for adding courses as instructor
    const handleInstructorJoinCodeChange = (event) => {
        setInstructorJoinCode(event.target.value);
    };
    const handleEditingInstructorJoinCode = (event) => {
        setEditingInstructorJoinCode(!editing_instructor_join_code);
    };

    /**
     * This function handles sign-out.
     * @param {*} event the current event
     */
    function handleSignOut(event) {
        event.preventDefault();
        localStorage.setItem("token", "");
        setToken("");
    }

    /**
     * Function is run on submit. We need to start the process of sending the data to the backend.
     * This function needs to be asynchronous so that we create the course before we refresh the course list.
     */
    async function handleSubmitCreateCourse(event) {
        event.preventDefault();

        // handle form submission here
        let new_course_id = await createCourse();

        // clear out text entry boxes
        setCourseName("");
        setCourseDescription("");

        // update the instructor courses list.
        await getCoursesEnrolledAsInstructor();

        if (new_course_id){
            let success = await getJoinCodes(new_course_id);
            
            if (success){
                setDisplayJoinCodesAfterCreate(true);
            }
            
        }
    }

    /**
     * Function is run on submit. We need to start the process of sending the data to the backend.
     * This function needs to be asynchronous so that we create the course before we refresh the course list.
     */
    async function handleSubmitStudentJoinCourse(event) {
        event.preventDefault();

        // handle form submission here
        await studentJoinCourse();

        // clear out text entry boxes
        setStudentJoinCode("");

        // update the student courses list.
        await getCoursesEnrolledAsStudent();
    }

    /**
     * Function is run on submit. We need to start the process of sending the data to the backend.
     * This function needs to be asynchronous so that we create the course before we refresh the course list.
     */
    async function handleSubmitInstructorJoinCourse(event) {
        event.preventDefault();

        // handle form submission here
        await instructorJoinCourse();

        // clear out text entry boxes
        setInstructorJoinCode("");

        // update the instructor courses list.
        await getCoursesEnrolledAsInstructor();
    }

    // The functions called inside this run at startup
    useLayoutEffect(() => {
        getCoursesEnrolledAsInstructor();
        getCoursesEnrolledAsStudent();
    }, [user_id]);

    /**
     * Loads the state variable with the courses that the user is currently enrolled in as an instructor.
     */
    async function getCoursesEnrolledAsInstructor() {
        const dataIn = {};
        dataIn["user_id"] = state.user_id;
        const parameters = new URLSearchParams(dataIn).toString();
        const response = await fetch(
            `http://localhost:8080/dashboard/GetCoursesEnrolledAsInstructor?${parameters}`
        );
        if (!response.ok)
            throw new Error(
                `Error loading instructor courses: ${response.statusText}`
            );
        const dataOut = await response.json();
        setInstructorCourseList(dataOut);
    }

    /**
     * Loads the state variable with the courses that the user is currently enrolled in as a student.
     */
    async function getCoursesEnrolledAsStudent() {
        const dataIn = {};
        dataIn["user_id"] = state.user_id;
        const parameters = new URLSearchParams(dataIn).toString();
        const response = await fetch(
            `http://localhost:8080/dashboard/GetCoursesEnrolledAsStudent?${parameters}`
        );
        if (!response.ok) {
            console.error(
                "Error loading student courses: ",
                response.statusText
            );
            return;
        }
        const dataOut = await response.json();
        setStudentCourseList(dataOut);
    }

    /**
     * create and execute a post request to the createCourse endpoint.
     */
    async function createCourse() {
        const dataIn = {
            user_id: user_id,
            course_name: course_name,
            course_description: course_description,
        };
        postOptions["body"] = JSON.stringify(dataIn);
        const response = await fetch(
            `http://localhost:8080/dashboard/createCourse`,
            postOptions
        );
        if (!response.ok){
            throw new Error(`Error creating the course ${response.statusText}`);
        }
        const dataOut = await response.json();
        return dataOut["course_id"];
    }

    /**
     * create and execute a post request to the JoinExistingCourseAsStudent endpoint.
     */
    async function studentJoinCourse() {
        const dataIn = {
            user_id: user_id,
            course_student_join_code: course_student_join_code,
        };
        postOptions["body"] = JSON.stringify(dataIn);
        const response = await fetch(
            `http://localhost:8080/dashboard/joinExistingCourseAsStudent`,
            postOptions
        );
        if (!response.ok)
            throw new Error(`Error creating the course ${response.statusText}`);
    }

    /**
     * create and execute a post request to the JoinExistingCourseAsStudent endpoint.
     */
    async function instructorJoinCourse() {
        const dataIn = {
            user_id: user_id,
            course_instructor_join_code: course_instructor_join_code,
        };
        postOptions["body"] = JSON.stringify(dataIn);
        const response = await fetch(
            `http://localhost:8080/dashboard/joinExistingCourseAsInstructor`,
            postOptions
        );
        if (!response.ok)
            throw new Error(`Error creating the course ${response.statusText}`);
    }

    /**
     * This function updates the state variables with the join codes based on the new_course_id specified.
     * @param {*} new_course_id the course id that we should grab join codes for 
     * @returns the course_id if successful.
     */
    async function getJoinCodes(new_course_id) {
        const dataIn = {};
        dataIn["user_id"] = state.user_id;
        dataIn["course_id"] = new_course_id;
        const parameters = new URLSearchParams(dataIn).toString();
        const response = await fetch(
            `http://localhost:8080/dashboard/GetCourseJoinCodes?${parameters}`
        );
        if (!response.ok)
            throw new Error(
                `Error loading join codes: ${response.statusText}`
            );
        const dataOut = await response.json();
        setOutputInstructorJoinCode(dataOut[0]["course_instructor_join_code"]);
        setOutputStudentJoinCode(dataOut[0]["course_student_join_code"]);
        if (dataOut){
            return new_course_id;
        } else {
            return 0;
        }
    }

    let tk = localStorage.getItem("token");
    if (parseInt(state.user_id) !== parseInt(tk) && useAuth) {
        return <>You are not allowed to view this page.</>;
    } else {
        return (
            /* Javascript tab toggling inspired by https://www.tutorialrepublic.com/codelab.php?topic=bootstrap&file=card-with-tabs-navigation */
            <>
                <section id="title bg-success">
                    <nav class="navbar navbar-dark bg-dark justify-content-between">
                        <a class="navbar-brand" href="/">
                            FIFO
                        </a>
                        <div class="container-fluid col">
                            <p class="navbar-brand mb-0 h1">Your Dashboard (@{user_id})</p>
                        </div>
                        <div className="col-lg-3 text-end">
                            <button
                                class="btn btn-outline-light btn-lg px-2 mx-2 my-2 my-sm-0"
                                type="submit"
                                onClick={handleSignOut}
                            >
                                Sign Out
                            </button>
                        </div>
                    </nav>
                </section>
                <div className="m-4">
                    <div className="card text-center">
                        <div className="card-header text-dark">
                            <ul
                                class="nav nav-tabs card-header-tabs"
                                id="myTab"
                            >
                                <li class="nav-item">
                                    <a
                                        href="#instructor"
                                        class="nav-link active"
                                        data-bs-toggle="tab"
                                    >
                                        Instructor
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a
                                        href="#student"
                                        class="nav-link"
                                        data-bs-toggle="tab"
                                    >
                                        Student
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="card-body">
                            <div className="tab-content">
                                {/* instructor tab*/}
                                <div
                                    className="tab-pane fade show active"
                                    id="instructor"
                                >
                                    <div className="row py-2 justify-content-center">
                                        <div className="col-sm-6">
                                            <button
                                                type="button"
                                                className="btn btn-dark"
                                                onClick={
                                                    handleEditingCreateCourse
                                                }
                                            >
                                                {editing_create_course ? (
                                                    <>
                                                        Hide
                                                    </>
                                                ) : (
                                                    <>Create a Course</>
                                                )}
                                            </button>
                                            {editing_create_course ? (
                                                <>
                                                    <div>
                                                        <form
                                                            className="form-group"
                                                            onSubmit={
                                                                handleSubmitCreateCourse
                                                            }
                                                        >
                                                            <label
                                                                for="course_name"
                                                                class="form-label mt-3 mb-1"
                                                            >
                                                                Course Name
                                                            </label>
                                                            <input
                                                                id="course_name"
                                                                className="form-control mb-1"
                                                                type="text"
                                                                value={
                                                                    course_name
                                                                }
                                                                onChange={
                                                                    handleCourseNameChange
                                                                }
                                                            />

                                                            <label
                                                                for="course_description"
                                                                class="form-label mb-1"
                                                            >
                                                                Course
                                                                Description
                                                            </label>
                                                            <input
                                                                id="course_description"
                                                                className="form-control py-1"
                                                                type="text"
                                                                value={
                                                                    course_description
                                                                }
                                                                onChange={
                                                                    handleCourseDescriptionChange
                                                                }
                                                            />

                                                            <button
                                                                class="btn btn-dark mt-2"
                                                                type="submit"
                                                            >
                                                                Submit
                                                            </button>

                                                            {display_join_codes_after_create ? (<>
                                                                <p>
                                                                    Course Successfully created. <br></br>
                                                                    Student Join code:   {output_student_join_code} <br></br>
                                                                    Instructor Join code:   {output_instructor_join_code} <br></br>
                                                                    Keep these codes in a safe place. <br></br>
                                                                </p>
                                                            </>) : (<></>)}
                                                        </form>
                                                    </div>
                                                </>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row py-2 justify-content-center">
                                        <div className="col-sm-6">
                                            <button
                                                type="button"
                                                className="btn btn-dark"
                                                onClick={
                                                    handleEditingInstructorJoinCode
                                                }
                                            >
                                                {editing_instructor_join_code ? (
                                                    <>Hide</>
                                                ) : (
                                                    <>
                                                        Add a Course as
                                                        Instructor
                                                    </>
                                                )}
                                            </button>
                                            {editing_instructor_join_code ? (
                                                <>
                                                    <div>
                                                        <form
                                                            className="form-group"
                                                            onSubmit={
                                                                handleSubmitInstructorJoinCourse
                                                            }
                                                        >
                                                            <label
                                                                for="join_code"
                                                                class="form-label mt-3 mb-1"
                                                            >
                                                                Instructor Join
                                                                Code
                                                            </label>
                                                            <input
                                                                id="join_code"
                                                                className="form-control mb-1"
                                                                type="text"
                                                                value={
                                                                    course_instructor_join_code
                                                                }
                                                                onChange={
                                                                    handleInstructorJoinCodeChange
                                                                }
                                                            />

                                                            <button
                                                                class="btn btn-dark mt-2"
                                                                type="submit"
                                                            >
                                                                Submit
                                                            </button>
                                                        </form>
                                                    </div>
                                                </>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row py-2 justify-content-center">
                                        <div className="col-sm-6">
                                            <h3>Instructor Courses</h3>
                                            <div className="dropdown">
                                                <button
                                                    className="btn btn-dark dropdown-toggle"
                                                    type="button"
                                                    data-bs-toggle="dropdown"
                                                >
                                                    Your Courses
                                                </button>
                                                <ul
                                                    className="dropdown-menu scrollable-menu"
                                                    role="menu"
                                                >
                                                    {instructor_course_list.map(
                                                        (
                                                            instructor_course_list_i
                                                        ) => (
                                                            <li class="dropdown-item justify-content-center text-center">
                                                                <h2
                                                                    key={
                                                                        "IC" +
                                                                        instructor_course_list_i.course_id
                                                                    }
                                                                >
                                                                    <Link
                                                                        to={`/instructorview/${state.user_id}/${instructor_course_list_i.course_id}`}
                                                                    >
                                                                        <button className="btn btn-dark">
                                                                            {
                                                                                instructor_course_list_i.course_name
                                                                            }
                                                                        </button>
                                                                    </Link>
                                                                </h2>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* student tab*/}
                                <div className="tab-pane fade" id="student">
                                    <div className="row py-2 justify-content-center">
                                        <div className="col-sm-6">
                                            <button
                                                type="button"
                                                className="btn btn-dark mb-2"
                                                onClick={
                                                    handleEditingStudentJoinCode
                                                }
                                            >
                                                {editing_student_join_codee ? (
                                                    <>Hide</>
                                                ) : (
                                                    <>Add a Course as Student</>
                                                )}
                                            </button>

                                            {editing_student_join_codee ? (
                                                <>
                                                    <div>
                                                        <form
                                                            className="form-group"
                                                            onSubmit={
                                                                handleSubmitStudentJoinCourse
                                                            }
                                                        >
                                                            <label
                                                                for="student_join_code"
                                                                class="form-label mt-3 mb-1"
                                                            ></label>
                                                            Student Join Code
                                                            <input
                                                                id="student_join_code"
                                                                className="form-control mb-1"
                                                                type="text"
                                                                value={
                                                                    course_student_join_code
                                                                }
                                                                onChange={
                                                                    handleStudentJoinCodeChange
                                                                }
                                                            />
                                                            <button
                                                                class="btn btn-dark mt-2"
                                                                type="submit"
                                                            >
                                                                Submit
                                                            </button>
                                                        </form>
                                                    </div>
                                                </>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row py-2 justify-content-center">
                                        <div className="col-sm-6">
                                            <h3>Student Courses</h3>
                                            <div className="dropdown">
                                                <button
                                                    className="btn btn-dark dropdown-toggle"
                                                    type="button"
                                                    data-bs-toggle="dropdown"
                                                >
                                                    Your Courses
                                                </button>
                                                <ul className="dropdown-menu">
                                                    {student_course_list.map(
                                                        (
                                                            student_course_list_i
                                                        ) => (
                                                            <li className="dropdown-item justify-content-center text-center">
                                                                <h2
                                                                    key={
                                                                        "SC" +
                                                                        student_course_list_i.course_id
                                                                    }
                                                                >
                                                                    <Link
                                                                        to={`/studentview/${state.user_id}/${student_course_list_i.course_id}`}
                                                                    >
                                                                        <button className="btn btn-dark">
                                                                            {
                                                                                student_course_list_i.course_name
                                                                            }
                                                                        </button>
                                                                    </Link>
                                                                </h2>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default Dashboard; // Makes component available to rest of application
