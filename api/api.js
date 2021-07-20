const express = require('express');
const usersRouter = require('./users.js');

const apiRouter = express.Router();

apiRouter.use('/users', usersRouter);

module.exports = apiRouter;