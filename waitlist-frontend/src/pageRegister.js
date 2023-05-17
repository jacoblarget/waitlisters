import React, { useState } from "react";
import "./index.css";
import { Navigate, Link} from "react-router-dom";
import { post } from "./api";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [accountCreated, setAccountCreated] = useState(false);

    async function createAccount() {
        const request = {name, email, password};
        if (!(new RegExp('@wisc.edu$')).test(email)) throw new Error("Invalid Wisc Email"); // ends @wisc.edu
        if (password !== confirmPassword) throw new Error("Passwords don't match"); // passwords match
        const response = await post("createAccount",request,"http://localhost:8080/account");
        if (response.ok) setAccountCreated(true);
    }

    if (accountCreated) {
        return <Navigate to={`/login`} />;
    } else {
        return (        <>
            <section id="title bg-success">
                    <nav class="navbar navbar-dark bg-light text-dark justify-content-between">
                        <a class="navbar-brand text-dark" href="/">
                            FIFO
                        </a>
                        <div className="col-lg-3 text-end">
                            <Link to="/login">
                                <button
                                    class="btn btn-warning btn-lg text-dark my-2 my-sm-0"
                                    type="submit"
                                >
                                    Login
                                </button>
                            </Link>
                        </div>
                    </nav>
                </section>
            <div className="App Credentials">
                <div class="card-body card mt-3 p-5">
                    <form className="form-group" onSubmit={createAccount}>
                        <h1 className="m-3 fw-normal h3">
                            Create a FIFO Account
                        </h1>
                        <div className="form-floating mb-3 mx-3">
                            <input
                                className="form-control bottom-border bg-dark text-light w-150"
                                id="name"
                                type="text"
                                placeholder="First and Last Name"
                                value={name}
                                onChange={(e) => {setName(e.target.value)}}
                                required
                            />
                            <label
                                className="text-secondary disabled"
                                htmlFor="name"
                            >
                                Name
                            </label>
                        </div>
                        <div className="form-floating mb-3 mx-3">
                            <input
                                className="form-control bottom-border bg-dark text-light w-150"
                                id="email"
                                placeholder="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => {setEmail(e.target.value)}}
                                required
                            />
                            <label
                                className="text-secondary disabled"
                                for="email"
                            >
                                Email Address
                            </label>
                        </div>
                        <div className="form-floating mb-3 mx-3">
                            <input
                                className="form-control bottom-border bg-dark text-light w-150"
                                id="password"
                                type="password"
                                placeholder="Password"
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
                        <div className="form-floating mb-3 mx-3">
                            <input
                                className="form-control bottom-border bg-dark text-light w-150"
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <label
                                className="text-secondary disabled"
                                htmlFor="confirmPassword"
                            >
                                Confirm Password
                            </label>
                        </div>
                        <div className="form-floating mb-3 mx-3">
                            <button
                                className="btn btn-primary mb-2"
                                type="submit"
                                onSubmit={createAccount}
                            >
                                Register
                            </button>
                        </div>
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