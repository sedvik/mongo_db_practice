const express = require('express');
const mongoose = require('mongoose');
const { User } = require('../database');

const usersRouter = express.Router();

// extract :userId parameter
usersRouter.param('userId', async (req, res, next, id) => {
    // check that id is valid id
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidId) {
        return res.status(400).send();
    }
    
    let user;
    try {
        user = await User.findById(id);
    } catch(err) {
        return next(err);
    }
    
    if (user) {
        req.userId = id;
        req.user = user;
    } else {
        return res.status(404).send();
    }
    next();
});

// Checks that request body has required body parameters
const newUserValidation = (req, res, next) => {
    const newUser = req.body.user;
    const username = newUser.username;
    const favoriteFood = newUser.favoriteFood;
    const favoriteNumber = newUser.favoriteNumber;
    
    if (!(username && favoriteFood && favoriteNumber) || (typeof username !== 'string' || typeof favoriteFood !== 'string' || typeof favoriteNumber !== 'number')) {
        return res.status(400).send();
    }
    next();
};

// GET /api/users
usersRouter.get('/', async (req, res, next) => {
    try {
        const users = await User.find({});
        res.status(200).send({users: users});
    } catch(err) {
        return next(err);
    }
});

// GET /api/users/:userId
usersRouter.get('/:userId', async (req, res, next) => {
    res.status(200).send({user: req.user});
});

// PUT /api/users/:userId
usersRouter.put('/:userId', newUserValidation, async (req, res, next) => {
    try {
        const newUser = req.body.user;
        await User.findByIdAndUpdate(req.userId, newUser);
        const updatedUser = await User.findById(req.userId);
        res.status(200).send({ user: updatedUser });
    } catch(err) {
        return next(err);
    }
});

// POST /api/users
usersRouter.post('/', newUserValidation, async (req, res, next) => {
    try {
        const newUser = req.body.user;
        let createdUser = await User.create(newUser);
        const id = createdUser._id;
        createdUser = await User.findById(id);
        res.status(200).send({ user: createdUser });
    } catch(err) {
        return next(err);
    }
});

// DELETE /api/users/:userId
usersRouter.delete('/:userId', async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.userId);
        res.status(204).send();
    } catch(err) {
        return next(err);
    } 
});

module.exports = usersRouter;