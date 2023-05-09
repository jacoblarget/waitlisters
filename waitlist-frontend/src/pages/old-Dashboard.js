// COMMENT EXPORT AT THE BOTTOM OF THE PAGE BACK IN TO USE

import "/app/src/App.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { get, post } from "../api";

/**
 * This function returns the HTML output for the dashboard page
 * @param {*} auth used for authentication
 * @returns HTML output for browser.
 */
function Dashboard({ setToken, useAuth }) {
    const dashboardBaseURL = "http://localhost:8080/dashboard";
    const { user_id } = useParams();
    const [instructor_course_list, setInstructorCourseList] = useState([]);
    const [student_course_list, setStudentCourseList] = useState([]);
    const [course_name, setCourseName] = useState("");
    const [course_description, setCourseDescription] = useState("");
    const [editing_create_course, setEditingCreateCourse] = useState(false);
    const [course_student_join_code, setStudentJoinCode] = useState("");
    const [editing_student_join_codee, setEditingStudentJoinCode] = useState(false);
    const [course_instructor_join_code, setInstructorJoinCode] = useState("");
    const [editing_instructor_join_code, setEditingInstructorJoinCode] = useState(false);
    const [display_join_codes_after_create, setDisplayJoinCodesAfterCreate] = useState(false);
    const [output_instructor_join_code, setOutputInstructorJoinCode] = useState("");
    const [output_student_join_code, setOutputStudentJoinCode] = useState(""); 

    async function handleSignOut(event) {
        event.preventDefault();
        localStorage.setItem("token", "");
        setToken("");
    }

    async function handleEditingCreateCourse(event) {
        if (editing_create_course){
            setDisplayJoinCodesAfterCreate(false);
        }
        setEditingCreateCourse(!editing_create_course);
    };

    async function handleSubmitCreateCourse(event) {
        event.preventDefault();
        let new_course_id = await createCourse();
        setCourseName("");
        setCourseDescription("");
        if (new_course_id){
            let success = await getJoinCodes(new_course_id);
            if (success) setDisplayJoinCodesAfterCreate(true);
        }
    }

    async function handleSubmitStudentJoinCourse(event) {
        event.preventDefault();
        await studentJoinCourse();
        setStudentJoinCode("");
    }

    async function handleSubmitInstructorJoinCourse(event) {
        console.log("Test");
    }

    // automatic rendering
    useEffect(() => {
        const interval = setInterval(async () => {
          const request = {user_id};
          const [instructorResponse, studentResponse] = await Promise.all([
            get("GetCoursesEnrolledAsInstructor", request, dashboardBaseURL),
            get("GetCoursesEnrolledAsStudent", request, dashboardBaseURL)
          ]);
          setStudentCourseList(studentResponse);
          setInstructorCourseList(instructorResponse);
        }, 500); // in ms, refresh speed
        return () => clearInterval(interval); // clean unmount
      }, [user_id]);
    async function createCourse() {
        const request = {user_id, course_name, course_description};
        const response = post('createCourse',request,dashboardBaseURL);
        return response["course_id"];
    }

    async function studentJoinCourse() {
        const request = {user_id, course_student_join_code};
        await post('joinExistingCourseAsStudent', request, dashboardBaseURL);
    }

    async function instructorJoinCourse() {
        const request = {user_id, course_instructor_join_code};
        await post('joinExistingCourseAsInstructor',request, dashboardBaseURL);
    }

    /**
     * This function updates the state variables with the join codes based on the new_course_id specified.
     * @param {*} new_course_id the course id that we should grab join codes for 
     * @returns the course_id if successful.
     */
    async function getJoinCodes(new_course_id) {
        const request = {user_id, course_id: new_course_id};
        const response = await get('GetCourseJoinCodes',request, dashboardBaseURL);
        setOutputInstructorJoinCode(response[0]["course_instructor_join_code"]);
        setOutputStudentJoinCode(response[0]["course_student_join_code"]);
        if (response) return new_course_id;
        return 0;
    }

    let tk = localStorage.getItem("token");
    if (parseInt(user_id) !== parseInt(tk) && useAuth) return <>You are not allowed to view this page.</>;
    return (<>
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
                                            onClick={handleEditingCreateCourse}
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
                                                            onChange={setCourseName(course_name)}
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
                                                                setCourseDescription(course_description)
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
                                            onClick={setEditingInstructorJoinCode(!editing_instructor_join_code)}
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
                                                            onChange={setInstructorJoinCode(course_instructor_join_code)}
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
                                                                    to={`/instructorview/${user_id}/${instructor_course_list_i.course_id}`}
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
                                            onClick={setEditingStudentJoinCode(!editing_student_join_codee)}
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
                                                            value={ course_student_join_code }
                                                            onChange={setStudentJoinCode(course_student_join_code)}
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
                                                                    to={`/studentview/${user_id}/${student_course_list_i.course_id}`}
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
        </>);
}
// export default Dashboard; // Makes component available to rest of application
