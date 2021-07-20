const mongoose = require('mongoose');
const { assert } = require('chai');
const request = require('supertest');
const { User, connectAndDrop, disconnect, seedDatabase } = require('../database');
const users = require('../users');
const app = require('../app');


describe('/api', () => {

    beforeEach(async () => {
        await connectAndDrop();
        await seedDatabase(users);
        await disconnect();
    });
    
    describe('GET /api/users', () => {
        it('returns with status 200', async () => {
            // setup
            const expectedStatus = 200;

            // exercise
            const response = await request(app)
                .get('/api/users')
                .send();

            // verify
            assert.strictEqual(response.status, expectedStatus);
        });

        it('returns an array', async () => {
            const response = await request(app)
                .get('/api/users')
                .send();

            const users = response.body.users;
            
            assert.instanceOf(users, Array);
        });

        it('returns an array of users with username, favoriteFood, favoriteNumber, and signupDate properties', async () => {    
            const response = await request(app)
                .get('/api/users')
                .send();

            const users = response.body.users;
            const user = users[0];

            assert.property(user, 'username', 'user has username property');
            assert.property(user, 'favoriteFood', 'user has favoriteFood property');
            assert.property(user, 'favoriteNumber', 'user has favoriteNumber property');
            assert.property(user, 'signupDate', 'user has signupDate property');
            assert.property(user, '_id', 'user has _id property');
        });

        it('contains 5 users (for seeded test database)', async () => {
            const expectedLength = 5;
            
            const response = await request(app)
                .get('/api/users')
                .send();
            
            const users = response.body.users;
            const length = users.length;

            assert.strictEqual(length, expectedLength);
        });
    });

    describe('GET /api/users/id', () => {
        it('returns with status 200 if id exists', async () => {
            // setup
            const expectedStatus = 200;

            // retrieve an id to use by extracting one from /api/users array
            const usersResponse = await request(app)
                .get('/api/users')
                .send();
            const userId = usersResponse.body.users[0]._id;

            // exercise
            const response = await request(app)
                .get(`/api/users/${userId}`)
                .send();

            // verify
            assert.equal(response.status, expectedStatus);

        });

        it('returns with status 400 if user with provided id is invalid', async () => {
            // setup
            const expectedStatus = 400;
            const fakeId = '13jdksodi';

            // exercise
            const response = await request(app)
                .get(`/api/users/${fakeId}`)
                .send();

            // verify
            assert.equal(response.status, expectedStatus);

        });

        it('returns with status 404 if user with provided id does not exist', async () => {
            // setup
            const expectedStatus = 404;
            const fakeId = '60f60153632a3537cc725000';

            // exercise
            const response = await request(app)
                .get(`/api/user/${fakeId}`)
                .send();

            // verify
            assert.equal(response.status, expectedStatus);
        })
        
        it('returns a single user with matching id', async () => {
            // setup - retrieve an id to use by extracting one from /api/users array
            const usersResponse = await request(app)
                .get('/api/users')
                .send();
            const userId = usersResponse.body.users[0]._id;
            
            // exercise
            const userResponse = await request(app)
                .get(`/api/users/${userId}`)
                .send();

            const user = userResponse.body.user;

            // verify
            assert.equal(user._id, userId);
            
        });
    });
    
    describe('PUT /api/users/id', () => {
        it('returns status 200 upon successful update', async () => {
            const expectedStatus = 200;
            // retrieve an id to use by extracting one from /api/users array
            const usersResponse = await request(app)
                .get('/api/users')
                .send();
            const userId = usersResponse.body.users[0]._id;
            const newUser = {
                username: 'Captain Brunch',
                favoriteFood: 'Caviar',
                favoriteNumber: 3
            };

            const response = request(app)
                .put(`/api/users/${userId}`)
                .send({ user: newUser });
            
            assert.equal((await response).status, expectedStatus);
        });

        it('returns status 400 if invalid id is provided', async () => {
            const expectedStatus = 400;
            const fakeId = '60f8c24';
            const newUser = {
                username: 'Captain Brunch',
                favoriteFood: 'Caviar',
                favoriteNumber: 3
            };

            const response = await request(app)
                .put(`/api/users/${fakeId}`)
                .send({ user: newUser });

            assert.equal(response.status, expectedStatus);
        });

        it('returns status 400 if required properties are not in request body', async () => {
            const expectedStatus = 400;
            // retrieve an id to use by extracting one from /api/users array
            const usersResponse = await request(app)
                .get('/api/users')
                .send();
            const userId = usersResponse.body.users[0]._id;
            
            // Missing favoriteNumber property
            const newUser = {
                username: 'Captain Brunch',
                favoriteFood: 'Caviar',
            };

            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({ user: newUser })

            assert.equal(response.status, expectedStatus);
        });

        it('returns status 400 if provided properties are not of correct data type', async () => {
            const expectedStatus = 400;
            // retrieve an id to use by extracting one from /api/users array
            const usersResponse = await request(app)
                .get('/api/users')
                .send();
            const userId = usersResponse.body.users[0]._id;

            // username is a number instead of a string
            const newUser = {
                username: 1234,
                favoriteFood: 'Caviar',
                favoriteNumber: 29
            };

            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({ user: newUser });

            assert.equal(response.status, expectedStatus);
        });

        it('returns status 404 if user with provided id does not exist', async () => {
            const expectedStatus = 404;
            const fakeId = '60f60153632a3537cc725000';
            const newUser = {
                username: 'Captain Brunch',
                favoriteFood: 'Caviar',
                favoriteNumber: 3
            };

            const response = await request(app)
                .put(`/api/users/${fakeId}`)
                .send({ user: newUser });

            assert.equal(response.status, expectedStatus);
        });

        it('updates the user with given id', async () => {
            // retrieve an id to use by extracting one from /api/users array
            const usersResponse = await request(app)
                .get('/api/users')
                .send();
            const originalUser = usersResponse.body.users[0];
            const userId = usersResponse.body.users[0]._id;
            const newUser = {
                username: 'Captain Brunch',
                favoriteFood: 'Caviar',
                favoriteNumber: 3
            }

            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({ user: newUser });

            const updatedUser = response.body.user;

            assert.notDeepEqual(updatedUser, originalUser);
            assert.include(updatedUser, newUser);
        });
    });

    describe('POST /api/users', () => {
        it('returns with status 200 upon succesful user creation', async () => {
            const expectedStatus = 200;
            const newUser = {
                username: 'serendipity',
                favoriteFood: 'omelette',
                favoriteNumber: 6
            };

            const response = await request(app)
                .post('/api/users')
                .send({ user: newUser });

            assert.equal(response.status, expectedStatus);
        });

        it('returns status 400 if required properties are not in request body', async () => {
            const expectedStatus = 400;
            // Missing username property
            const newUser = {
                favoriteFood: 'sushi',
                favoriteNumber: 92
            };

            const response = await request(app)
                .post('/api/users')
                .send({ user: newUser });

            assert.equal(response.status, expectedStatus);
        });

        it('returns status 400 if provided properties are not of correct data type', async () => {
            const expectedStatus = 400;
            // favoriteNumber is a string instead of a number
            const newUser = {
                username: 'serendipity',
                favoriteFood: 'omelette',
                favoriteNumber: 'sdsdfj'
            };

            const response = await request(app)
                .post('/api/users')
                .send({ user: newUser });

            assert.equal(response.status, expectedStatus);
        });

        it('returns a user object containing the provided properties', async () => {
            const newUser = {
                username: 'serendipity',
                favoriteFood: 'omelette',
                favoriteNumber: 6
            };

            const response = await request(app)
                .post('/api/users')
                .send({ user: newUser });
            const createdUser = response.body.user;

            assert.include(createdUser, newUser);
        });
    });

    describe('DELETE /api/users/id', () => {
        it('returns status 204 upon successful deletion', async () => {
            const expectedStatus = 204;
            // retrieve an id to use by extracting one from /api/users array
            const usersResponse = await request(app)
                .get('/api/users')
                .send();
            const originalUser = usersResponse.body.users[0];
            const userId = usersResponse.body.users[0]._id;

            const response = await request(app)
                .delete(`/api/users/${userId}`)
                .send();

            assert.equal(response.status, expectedStatus);
        });

        it('returns status 404 if making a request for a deleted asset', async () => {
            const expectedStatus = 404;
            // retrieve an id to use by extracting one from /api/users array
            const usersResponse = await request(app)
                .get('/api/users')
                .send();
            const originalUser = usersResponse.body.users[0];
            const userId = usersResponse.body.users[0]._id;

            await request(app)
                .delete(`/api/users/${userId}`)
                .send();

            // perform GET request for deleted asset
            const response = await request(app)
                .get(`/api/users/${userId}`)
                .send();

            assert.equal(response.status, expectedStatus);
        });

        it('returns status 404 if user with provided id does not exist', async () => {
            const expectedStatus = 404;
            const fakeId = '60f60153632a3537cc725000';

            const response = await request(app)
                .delete(`/api/users/${fakeId}`)
                .send();

            assert.equal(response.status, expectedStatus);
        });

        it('returns status 400 if a valid id is not provided', async () => {
            const expectedStatus = 400;
            const fakeId = '60237dff';

            const response = await request(app)
                .delete(`/api/users/${fakeId}`)
                .send();

            assert.equal(response.status, expectedStatus);
        });
    });
    
});

