const mongoose = require('mongoose');
const userSchema = require('./userSchema');
require('dotenv').config();

mongoose.set('useFindAndModify', false);

// Create model
const User = mongoose.model('User', userSchema);

// Functions for connecting and disconnecting from database
const connect = async () => {
        // Pull db username and password from environment variables
        const dbUser = process.env.MONGO_USER;
        const dbPassword = encodeURIComponent(process.env.MONGO_PW); // PW must be URL encoded
    
        // Connection string from MongoDB Atlas - Requires accessing IP addresses to be whitelisted
        const connectionString = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.opzc2.mongodb.net/users?retryWrites=true&w=majority`;
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        };
        try {
            await mongoose.connect(connectionString, options);
        } catch(err) {
            console.log(err);
        }
}

const connectAndDrop = async () => {
    try {
        await connect();
        await mongoose.connection.db.dropCollection('users');
    } catch(err) {
        console.log(err);
    }
}

const disconnect = async () => {
    try {
        await mongoose.disconnect();
    } catch(err) {
        console.log(err);
    }
}

const dropDatabase = async () => {
    try {
        await mongoose.connection.db.dropCollection('users');
    } catch(err) {
        console.log(err);
    }
}

const seedDatabase = async users => {
    await User.insertMany(users);
}

module.exports = {
    User,
    connect,
    connectAndDrop,
    disconnect,
    dropDatabase,
    seedDatabase,
};

