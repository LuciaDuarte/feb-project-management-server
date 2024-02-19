// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require('dotenv').config();

// ℹ️ Connects to the database
require('./db');

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require('express');

// const { isAuthenticated } = require('./middleware/jwt.middleware');
const isAuthenticated = require('./middleware/firebase.middleware');

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require('./config')(app);

// 👇 Start handling routes here
const indexRoutes = require('./routes/index.routes');
app.use('/api', indexRoutes);

const projectRoutes = require('./routes/project.routes');
app.use('/api', isAuthenticated, projectRoutes);

const taskRoutes = require('./routes/task.routes');
app.use('/api', isAuthenticated, taskRoutes);

const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app);

console.log('re-adding stuff');

module.exports = app;
