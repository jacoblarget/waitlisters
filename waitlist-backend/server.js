'use strict';
//Imports
const express = require('express');
var cors = require("cors");
var accountRouter = require('./routes/accountRoutes');
var studentRouter = require('./routes/studentRoutes');
var instructorRouter = require('./routes/instructorRoutes');
var dashboardRouter = require('./routes/dashboardRoutes');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// Declare the Express App
const app = express();

//Allow Cross-Origin Resource Sharing in the app
app.use(cors());

//Allows us the ability to parse the 'body' of HTTP Requests
app.use(express.json());

// Tells server.js which file is responsible for handling authentication
app.use('/account', accountRouter)

//Tells server.js which file is responsible for the handling of /student HTTP Requests
app.use('/student', studentRouter);

//Tells server.js which file is responsible for the handling of /instructor HTTP Requests
app.use('/instructor', instructorRouter);

//Tells server.js which file is responsible for the handling of /dashboard HTTP Requests
app.use('/dashboard', dashboardRouter);

//Binds our app to specified port and listens for incoming HTTP requests
app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
