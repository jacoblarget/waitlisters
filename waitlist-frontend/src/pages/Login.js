import React, { useState } from "react";
import PropTypes from "prop-types";
import "../index.css";
import { Link, useNavigate } from "react-router-dom";
import { post } from "../api";
import { Toaster, toast } from "react-hot-toast";

function storeToken(userToken) {
    localStorage.setItem("token", JSON.stringify(userToken));
}

function Login({ setToken }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function signIn(event) {
        event.preventDefault();
        const request = { username, password };
    
        try {
          const response = await post("signIn", request, "http://localhost:8080/account");
          setToken(response.user_id);
          storeToken(response.user_id);
          navigate(`/dashboard/${response.user_id}`);
        } catch (error) {
          toast.error(error.response.data);
        }
      }
    
    return(<>
        <Toaster position="bottom-center" />
        <section id="title bg-success">
            <nav className="navbar navbar-dark bg-light text-dark justify-content-between">
                <a className="navbar-brand text-dark" href="/">
                    FIFO
                </a>
                <div className="col-lg-3 text-end">
                <Link to="/register">
                    <button
                        className="btn btn-warning btn-lg text-dark my-2 my-sm-0"
                        type="submit"
                    >
                        Register
                    </button>
                </Link>
                </div>  
            </nav>
        </section>
        <div className="App Credentials">
            <div className="card-body card mt-3 p-5">
                <form className="form-group" onSubmit={signIn}>
                    <h1 className="m-3 fw-normal h3">Login to FIFO</h1>
                    <div className="form-floating mb-3 mx-3">
                        <input
                            className="form-control bottom-border bg-dark text-light w-150"
                            id="username"
                            placeholder="Username"
                            type="email"
                            value={username}
                            onChange={(e) => {setUsername(e.target.value)}}
                            required
                        />
                        <label
                            className="text-secondary disabled"
                            htmlFor="username"
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
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label
                            className="text-secondary disabled"
                            htmlFor="password"
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
                </form>
                <p className="mt-5 mb-3 text-body-secondary">
                    © 2023 Waitlisters
                </p>
            </div>
        </div>
    </>);
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired,
    token: PropTypes.number.isRequired,
};

export default Login; // adds component to application
