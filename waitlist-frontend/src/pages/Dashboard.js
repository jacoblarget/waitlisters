import "/app/src/App.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { get, post } from "../api";

function Dashboard({ setToken, useAuth }) {
    const dashboardBaseURL = "http://localhost:8080/dashboard";
    const { user_id } = useParams();
    const [course_list, setCourseList] = useState([]);
    const [course_name, setCourseName] = useState("");
    const [course_description, setCourseDescription] = useState("");
    const [join_code, setJoinCode] = useState("");
    const headers = ["Course Name", "Permission Type", "Join (Code)"];

    async function handleSignOut(event) {
      event.preventDefault();
      localStorage.setItem("token", "");
      setToken("");
    }

    async function createCourse() {
      const request = { user_id, course_name, course_description };
      await post('createCourse', request, dashboardBaseURL);
      setCourseName("");
      setCourseDescription("");
    }

    async function joinCourse(){
      const request = { user_id, join_code };
      await post('joinCourse', request, dashboardBaseURL);
      setJoinCode("");
    }

    // automatic rendering
    useEffect(() => {
        const interval = setInterval(async () => {
          const request = { user_id };
          const [coursesResponse] = await Promise.all([
            get("getEnrolledCourses", request, dashboardBaseURL)
          ]);
          setCourseList(coursesResponse);
        }, 500); // in ms, refresh speed
        return () => clearInterval(interval); // clean unmount
      }, [user_id]);

    let tk = localStorage.getItem("token");
    if (parseInt(user_id) !== parseInt(tk) && useAuth) return <>You are not allowed to view this page.</>;
    return (<>
    <section id="title" class="bg-success">
    <nav class="navbar navbar-dark bg-dark justify-content-between">
      <a className="navbar-brand" href="/">FIFO</a>
      <div class="col">
        <p class="navbar-brand mb-0 h1 text-center">Welcome to your Dashboard, @{user_id}!</p>
      </div>
      <div class="col-lg-3 text-end">
        <button class="btn btn-outline-light btn-lg px-2 mx-2 my-2 my-sm-0" type="submit" onClick={handleSignOut}> Sign Out </button>
      </div>
    </nav>
  </section>
    <div class="col-lg-6 mb-2">
      <div class="card">
        <div class="card-body">
<table className="table table-success table-hover table-bordered table-responsive-md">
  <thead>
    <tr className="text-center">
      {headers.map((header, index) => (
        <th scope="col" key={index}>
          {header}
        </th>
      ))}
    </tr>
  </thead>
  <tbody>
    {course_list.map(({ course_name, permission_type, course_id, course_student_join_code, course_instructor_join_code}, index) => (
      <tr className="text-center" key={index}>
        <td>{course_name}</td>
        <td>{permission_type}</td>
        <td>
          {permission_type === "STUDENT" ? (
            <Link to={`/studentview/${user_id}/${course_id}`}>
              <button className="btn btn-dark">{course_student_join_code}</button>
            </Link>
          ) : (
            <Link to={`/instructorview/${user_id}/${course_id}`}>
              <button className="btn btn-dark">{course_instructor_join_code + " " + course_student_join_code}</button>
            </Link>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>
      </div>
      <div class="row m-3">
    <div class="col-lg-6 mb-3 sticky-top">
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-center align-items-center mb-3">
            <div class="w-50">
              
                <div class="w-75">
                <input className="form-control bottom-border" placeholder={"Join Code"} type="text" value={join_code} onChange={(e) => setJoinCode(e.target.value)} />
                <button class="btn btn-dark btn-sm btn-block mt-2 btn-modified" onClick={joinCourse}>joinCourse</button>
                </div>
                <div class="d-flex justify-content-center align-items-center">
                <div class="mb-3">
              <input className="form-control bottom-border" placeholder={"Course Name"} type="text" value={course_name} onChange={(e) => setCourseName(e.target.value)} />
              <input className="form-control bottom-border" placeholder={"Course Description"} type="text" value={course_description} onChange={(e) => setCourseDescription(e.target.value)} /> 
              <button class="btn btn-dark btn-sm btn-block mt-2 btn-modified" onClick={createCourse}>createCourse</button>
              </div>
              </div>
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
export default Dashboard;