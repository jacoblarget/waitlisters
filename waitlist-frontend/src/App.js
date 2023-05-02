import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/Register.js";
import Homepage from "./pages/Homepage";
import StudentView from "./pages/StudentView.js";
import Dashboard from "./pages/Dashboard.js";
import InstructorView from "./pages/InstructorView";
import Login from "./pages/Login";

//This is the main file for front-end application. React Router creates routes to connect components to a specified URL.
function App() {
    const [token, setToken] = useState();
    const [rendered, setRendered] = useState(false);

    // to bypass login for testing purposes, set useAuth to false.
    //Then authentication will be disabled and you can access any url by typing
    // it in the search bar
    let useAuth = true;
    //let useAuth = false;

    if (!rendered) {
        setToken(localStorage.getItem("token"));
        setRendered(true);
    }

    if (!useAuth) {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Homepage />} />
                </Routes>
                <Routes>
                    <Route path="/register" element={<Register />} />
                </Routes>
                <Routes>
                    <Route
                        path="/studentview/:user_id/:course_id"
                        element={<StudentView />}
                    />
                </Routes>
                <Routes>
                    <Route
                        path="/instructorview/:user_id/:course_id"
                        element={<InstructorView />}
                    />
                </Routes>
                <Routes>
                    <Route path="/login" element={<Login />} />
                </Routes>
                <Routes>
                    <Route path="/dashboard/:user_id" element={<Dashboard />} />
                </Routes>
            </BrowserRouter>
        );
    } else {
        return (
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            token ? (
                                <Navigate to={`/dashboard/${token}`} />
                            ) : (
                                <Homepage />
                            )
                        }
                    />
                </Routes>

                <Routes>
                    <Route path="/register" element={<Register />} />
                </Routes>
                <Routes>
                    <Route
                        path="/studentview/:user_id/:course_id"
                        element={
                            token ? <StudentView /> : <Navigate to="/" />
                        }
                    />
                </Routes>
                <Routes>
                    <Route
                        path="/instructorview/:user_id/:course_id"
                        element={
                            token ? (
                                <InstructorView />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                </Routes>
                <Routes>
                    <Route
                        path="/login"
                        element={<Login setToken={setToken} />}
                    />
                </Routes>
                <Routes>
                    <Route
                        path="/dashboard/:user_id"
                        element={
                            token ? (
                                <Dashboard
                                    useAuth={useAuth}
                                    setToken={setToken}
                                />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                </Routes>
            </BrowserRouter>
        );
    }
}

export default App;
