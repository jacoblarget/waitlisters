import "./index.css";
import React from "react";
import { Link } from "react-router-dom";

export default function Homepage(){
    return (<>
        <section id="title bg-success">
                <nav className="navbar navbar-dark bg-dark justify-content-between">
                    <a className="navbar-brand" href="/">FIFO</a>
                    <div className="col-lg-3 text-end">
                        <Link to="/login">
                            <button type="submit" className="btn btn-outline-light btn-lg px-2 mx-2 my-2 my-sm-0">Login</button>
                        </Link>
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

                <div className="my-5">
                    <div className="p-5 text-center bg-body-tertiary">
                        <div className="container py-5">
                            <h1 className="text-body-emphasis">
                                FIFO: First In First Out
                            </h1>
                            <p className="col-lg-8 mx-auto lead">
                                Tired of the long queues during
                                office-hours? Use FIFO and get help in{" "}
                                <code>O(1) time!</code>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <section id="features">
                <div className="row static bg-body-tertiary text-center p-5 m-5">
                    <div className="center col-lg-4">
                        <h3>Wait and Wander</h3>
                        <p> Join a queue and continue with your day! You'll be notified when it's your turn. </p>
                    </div>
                    <div className="center col-lg-4">
                        <h3>Multiple Roles</h3>
                        <p> Whether you're an instructor or student, all you need is one account!</p>
                    </div>
                </div>
                <div className="my-5 border-top">
                    <div className="p-5 text-center bg-body-tertiary">
                        <div className="container py-5" id="about">
                            <h1 className="text-body-emphasis">
                                About Our Mission
                            </h1>
                            <p className="col-lg-8 mx-auto lead">
                                Introducing FIFO, the cutting-edge web
                                platform that enables students to join a
                                virtual queue for office hours and helps
                                instructors manage their queues efficiently.
                                No more waiting in physical lines outside a
                                professor's office or wasting valuable time.
                                With FIFO, students can digitally join the
                                queue from anywhere, anytime. They can view
                                their position in the queue, receive
                                estimated wait times, and get notified when
                                it's their turn to meet with the instructor.
                                Instructors can manage the queue seamlessly
                                through an intuitive dashboard that displays
                                real-time queue status, student information,
                                wait times, and more. They can prioritize
                                urgent requests, send notifications to
                                students, and effectively manage their
                                office hours. Additionally, instructors can
                                gather queue metrics and valuable insights
                                that can inform their teaching practices.
                                FIFO is a user-friendly and efficient
                                platform that simplifies the
                                student-instructor interaction and
                                streamlines office hours for both parties.
                                Say goodbye to physical queues and hello to
                                a seamless office hour experience with FIFO.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <section id="footer" className="bg-dark py-1">
                <div className="container-fluid bg-dark text-white py-0 align-middle">
                    <footer className="bg-dark d-flex justify-content-between align-middle py-2 my-1 px-2 mx-5">
                        <div className="col-md-4 text-center">
                            <p>Developed by UW-Madison Students</p>
                        </div>
                        <div className="col-md-4 text-center">
                            <p>© 2023 Waitlisters</p>
                        </div>
                        <div className="col-md-4 text-center">
                            <p>Beta Version</p>
                        </div>
                    </footer>
                </div>
            </section>
        </>);
}