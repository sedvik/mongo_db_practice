const mongoose = require('mongoose');
const { User, connectAndDrop, disconnect, seedDatabase } = require('../database');
const { assert } = require('chai');
const users = require('../users');

// Define custom async error throwing function
const expectThrowsAsync = async (method, errSubstring) => {
    let error = null;
    try {
        await method();
    } catch (err) {
        error = err;
    }
    assert.instanceOf(error, Error);
    assert.include(error.message, errSubstring);
}

describe('database.js User Functionality', () => {
    beforeEach(async () => {
        await connectAndDrop();
        return await seedDatabase(users);
    });

    afterEach(async () => {
        return await disconnect();
    });

    describe('.findOne', () => {
        it('returns null when collection is empty', async () => {
            // setup
            await User.deleteMany({});

            // exercise
            const foundDoc = await User.findOne({});

            //verify
            assert.isNull(foundDoc, 'foundDoc is null');
        });

        it('returns null when document is not in collection', async () => {
            const nonexistantUsername = 'PaulyShore';

            const foundDoc = await User.findOne({ username: nonexistantUsername });

            assert.isNull(foundDoc, 'username is not in collection');
        });

        it('responds with a document when collection has items', async () => {
            const foundDoc = await User.findOne({});
            
            assert.instanceOf(foundDoc, mongoose.Document, 'foundDoc is an instance of mongoose.Document');
        });

        it('returns specified document by username', async () => {
            const username = 'Takdium';

            const foundDoc = await User.findOne({ username: username });

            assert.strictEqual(foundDoc.username, username, 'foundDoc.username equals provided username');
        });

        it('returns appropriate datatypes', async () => {
            const username = 'Testuzaemon';

            const foundDoc = await User.findOne({ username: username });

            assert.isString(foundDoc.username, 'username is a string');
            assert.isString(foundDoc.favoriteFood, 'favorite food is a string');
            assert.isNumber(foundDoc.favoriteNumber, 'favorite number is a number');
        });
    });

    describe('.create', () => {
        it('creates a specified document', async () => {
            const docToInsert = {
                username: 'Zain',
                favoriteFood: 'Peanut Butter',
                favoriteNumber: 1
            };

            await User.create(docToInsert);

            const createdUser = await User.findOne({ username: docToInsert.username });
            assert.instanceOf(createdUser, mongoose.Document, 'createdUser is an instance of mongoose.Document');
            assert.strictEqual(createdUser.username, docToInsert.username);
            assert.strictEqual(createdUser.favoriteFood, docToInsert.favoriteFood);
            assert.strictEqual(createdUser.favoriteNumber, docToInsert.favoriteNumber);
        });

        it('throws a validation error if a required field is omitted', async () => {
            const fnToTest = async () => {
                const docToInsert = {
                    username: 'Coco',
                    favoriteFood: 'Beans'
                };
                await User.create(docToInsert);
            };
            await expectThrowsAsync(fnToTest, 'User validation failed');
        });
    });

    describe('.updateOne', () => {
        it('updates document with given username', async () => {
            const username = 'Takdium';
            const newFavoriteFood = 'Prime Rib';
    
            await User.updateOne({ username: username }, { favoriteFood: newFavoriteFood });

            const updatedUser = await User.findOne({ username: username });
            assert.strictEqual(updatedUser.username, username);
            assert.strictEqual(updatedUser.favoriteFood, newFavoriteFood);
        });
    });

    describe('.deleteOne', () => {
        it('deletes document with given username', async () => {
            const username = 'Takdium';

            await User.deleteOne({ username: username });

            const deletedUser = await User.findOne({ username: username });
            assert.isNull(deletedUser, 'deletedUser is null');
        });
    });
});
