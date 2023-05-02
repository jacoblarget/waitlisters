import React, { useState } from "react";
import "/app/src/App.css";
import { Navigate, Link} from "react-router-dom";


/**
 * This function creates the frontend user account register page.
 * @returns Nothing
 */
function Register() {
    // These are the current state of the webpage, which are the values of the textbox entries.
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [registerStatus, setRegisterStatus] = useState("");
    const [accountCreated, setAccountCreated] = useState(false);

    // These functions handle updating the state variables to match the values in the textboxes.
    const handleFirstNameChange = (event) => {
        setFirstName(event.target.value);
    };
    const handleLastNameChange = (event) => {
        setLastName(event.target.value);
    };
    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };
    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };
    const handleConfirmPasswordChange = (event) => {
        setConfirmPassword(event.target.value);
    };

    // Function is run on submit. We need to start the process of sending the data to the backend.
    const handleSubmit = (event) => {
        event.preventDefault();

        // handle form submission here
        submitCreateAccount();
    };

    // Details about the post request.
    const postOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    /**
     * Send the post request to the backend.
     */
    async function submitCreateAccount() {
        // Construct the body of the request.
        const dataIn = {
            name: firstname + " " + lastname,
            email: email,
            password: password,
        };

        // Convert to a JSON object
        postOptions["body"] = JSON.stringify(dataIn);

        //Set Base Register Status to Empty String
        setRegisterStatus("");

        //Check if email is a @wisc.edu email
        if (!(new RegExp('@wisc.edu' + '$')).test(email)) {
            setRegisterStatus("Invalid Wisc Email");
            return;
        }

        //Check if passwords match
        if (password !== confirmPassword){
            setRegisterStatus("Passwords don't match");
            return;
        }

        // Send the request to add account to the database
        const response = await fetch(
            `http://localhost:8080/account/accountCreateAccount`,
            postOptions
        );

        if (!response.ok){
            throw new Error(`error making account: ${response.statusText}`);
        }
        if (response.ok) {
          setAccountCreated(true);
        }
    }

    // Return the HTML for the page.
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
                    <form className="form-group" onSubmit={handleSubmit}>
                        <h1 className="m-3 fw-normal h3">
                            Create a FIFO Account
                        </h1>
                        <div className="form-floating mb-3 mx-3">
                            <input
                                className="form-control bottom-border bg-dark text-light w-150"
                                id="firstName"
                                type="text"
                                placeholder="First Name"
                                value={firstname}
                                onChange={handleFirstNameChange}
                                required
                            />
                            <label
                                className="text-secondary disabled"
                                for="firstName"
                            >
                                First Name
                            </label>
                        </div>
                        <div className="form-floating mb-3 mx-3">
                            <input
                                className="form-control bottom-border bg-dark text-light w-150"
                                id="lastName"
                                type="text"
                                placeholder="Last Name"
                                value={lastname}
                                onChange={handleLastNameChange}
                                required
                            />
                            <label
                                className="text-secondary disabled"
                                for="lastName"
                            >
                                Last Name
                            </label>
                        </div>
                        <div className="form-floating mb-3 mx-3">
                            <input
                                className="form-control bottom-border bg-dark text-light w-150"
                                id="email"
                                placeholder="Email Address"
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
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
                        <div className="form-floating mb-3 mx-3">
                            <input
                                className="form-control bottom-border bg-dark text-light w-150"
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                required
                            />
                            <label
                                className="text-secondary disabled"
                                for="confirmPassword"
                            >
                                Confirm Password
                            </label>
                        </div>
                        <div className="form-floating mb-3 mx-3">
                            <button
                                className="btn btn-primary mb-2"
                                type="submit"
                                onSubmit={handleSubmit}
                            >
                                Register
                            </button>
                        </div>
                        <p>
                            {registerStatus}
                        </p> 
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
export default Register;
