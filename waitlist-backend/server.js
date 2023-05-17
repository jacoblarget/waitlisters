'use strict';
require('dotenv').config();
// .env must be copied from the main directory to waitlist-backend for now
const express = require('express');
const cors = require("cors");
const accountRouter = require('./routeAccount');
const studentRouter = require('./routeStudent');
const instructorRouter = require('./routeInstructor');
const dashboardRouter = require('./routeDashboard');

const PORT = process.env.BACKEND_PORT;
const HOST = process.env.BACKEND_HOST;

const app = express();
app.use(cors()); // lets us talk between containers
app.use(express.json()); // lets us parse the 'body' of HTTP Requests
// maps API requests to route files
app.use('/account', accountRouter);
app.use('/student', studentRouter);
app.use('/instructor', instructorRouter);
app.use('/dashboard', dashboardRouter);

// listens for HTTP Requests from the following address
app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
