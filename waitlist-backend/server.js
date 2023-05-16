'use strict';
//Imports
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// above code doesn't work :/
const express = require('express');
const cors = require("cors");
const accountRouter = require('./routeAccount');
const studentRouter = require('./routeStudent');
const instructorRouter = require('./routeInstructor');
const dashboardRouter = require('./routeDashboard');

// Constants
const PORT = process.env.BACKEND_PORT || 8080; // default needed, .env isn't working
const HOST = '0.0.0.0';

const app = express();
app.use(cors()); // lets us talk between containers
app.use(express.json()); // lets us parse the 'body' of HTTP Requests
// maps API requests to route files
app.use('/account', accountRouter);
app.use('/student', studentRouter);
app.use('/instructor', instructorRouter);
app.use('/dashboard', dashboardRouter);

//Binds our app to specified port and listens for incoming HTTP requests
app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
