const express = require('express');
const morgan = require('morgan');
const apiRouter = require('./api/api.js');
const { User, connect, connectAndDrop, disconnect, seedDatabase } = require('./database');
const users = require('./users');

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 5000;

// Connect to db
app.use(async (req, res, next) => {
    await connect();
    next();
});

// Mount /api
app.use('/api', apiRouter);

// Disconnect from db
app.use(async (req, res, next) => {
    await disconnect();
    next();
});


app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}...`);
});

module.exports = app;