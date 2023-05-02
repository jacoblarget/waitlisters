import React, { useState } from "react";
import PropTypes from "prop-types";
import "../App.css";
import { Link, Navigate, Route, Routes } from "react-router-dom";

function storeToken(userToken) {
    localStorage.setItem("token", JSON.stringify(userToken));
}

function Login({ setToken }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [authenticated, setAuthenitcated] = useState(false);
    const [userId, setUserId] = useState("");
    const [error, setError] = useState("");

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
        console.log(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };
    /*
     * This handles authentication by calling the backend api to see
     * if there is a matching email and password. It then sets the appropriate states
     * to show that the user has been authenticated. Moreover, it sets the token prop that
     * was passed from App.js to the user_id of the user.
     */
    async function handleSubmit(event) {
        event.preventDefault();
        console.log(`Username: ${username}, Password: ${password}`);
        const dataIn = {};
        dataIn["username"] = username;
        dataIn["password"] = password;
        const parameters = new URLSearchParams(dataIn).toString();
        const response = await fetch(
            `http://localhost:8080/account/accountSignIn?${parameters}`
        );
        if (!response.ok) {
            setError("Incorrect username or password");
            console.error("Incorrect password", response.text);
            return;
        }
        const dataOut = await response.json();
        setToken(dataOut.user_id);
        setUserId(dataOut.user_id);
        setAuthenitcated(true);
        storeToken(dataOut.user_id);
    }

    if (authenticated) {
        return <Navigate to={`/dashboard/${userId}`} />;
    } else {
        return (
            <>
                <section id="title bg-success">
                    <nav class="navbar navbar-dark bg-light text-dark justify-content-between">
                        <a class="navbar-brand text-dark" href="/">
                            FIFO
                        </a>
                        <div className="col-lg-3 text-end">
                        <Link to="/register">
                            <button
                                class="btn btn-warning btn-lg text-dark my-2 my-sm-0"
                                type="submit"
                            >
                                Register
                            </button>
                        </Link>
                        </div>  
                    </nav>
                </section>
                <div className="App Credentials">
                    <div class="card-body card mt-3 p-5">
                        <form className="form-group" onSubmit={handleSubmit}>
                            <h1 className="m-3 fw-normal h3">Login to FIFO</h1>
                            <div className="form-floating mb-3 mx-3">
                                <input
                                    className="form-control bottom-border bg-dark text-light w-150"
                                    id="username"
                                    placeholder="Username"
                                    type="email"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    required
                                />
                                {/*pattern="[A-z0-9a-z]+@wisc.edu" title="Please enter a valid UW-Madison email address."*/}
                                <label
                                    className="text-secondary disabled"
                                    for="username"
                                >
                                    Email Address
                                </label>
                            </div>
                            <div className="form-floating mx-3">
                                <input
                                    className="form-control bottom-border mb-3 bg-dark text-light w-150"
                                    id="password"
                                    placeholder="Password"
                                    type="password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                                <label
                                    className="text-secondary disabled"
                                    for="password"
                                >
                                    Password
                                </label>
                            </div>
                            <div className="row mb-3 mx-3">
                                <button
                                    type="submit"
                                    className="btn btn-primary mb-2"
                                >
                                    Submit
                                </button>
                            </div>
                            <>{error}</>
                        </form>
                        <p class="mt-5 mb-3 text-body-secondary">
                            © 2023 Waitlisters
                        </p>
                    </div>
                </div>
            </>
        );
    }
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired,
};

export default Login; // Makes component available to rest of application
