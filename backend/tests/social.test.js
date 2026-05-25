const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../app');
const { connectDB } = require('../config/db');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

let mongoServer;

const registerUser = (username, email) =>
  request(app).post('/api/auth/register').send({
    username,
    email,
    password: 'secret123'
  });

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDB(mongoServer.getUri());
});

afterEach(async () => {
  await Promise.all([User.deleteMany({}), Post.deleteMany({}), Comment.deleteMany({})]);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('social media API', () => {
  it('connects to the database', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  it('registers and logs in a user', async () => {
    const registerResponse = await registerUser('alice', 'alice@example.com');

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.token).toBeTruthy();
    expect(registerResponse.body.user.email).toBe('alice@example.com');

    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'secret123'
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeTruthy();
  });

  it('creates posts, saves comments, and toggles likes', async () => {
    const { body } = await registerUser('creator', 'creator@example.com');

    const postResponse = await request(app)
      .post('/api/posts')
      .set(authHeader(body.token))
      .send({ content: 'Hello from CodeAlpha!' });

    expect(postResponse.status).toBe(201);
    expect(postResponse.body.content).toBe('Hello from CodeAlpha!');

    const savedPost = await Post.findById(postResponse.body._id);
    expect(savedPost).toBeTruthy();

    const commentResponse = await request(app)
      .post(`/api/posts/${postResponse.body._id}/comment`)
      .set(authHeader(body.token))
      .send({ text: 'First comment' });

    expect(commentResponse.status).toBe(201);
    expect(commentResponse.body.comments).toHaveLength(1);

    const savedComment = await Comment.findOne({ text: 'First comment' });
    expect(savedComment).toBeTruthy();

    const likeResponse = await request(app)
      .put(`/api/posts/${postResponse.body._id}/like`)
      .set(authHeader(body.token));

    expect(likeResponse.status).toBe(200);
    expect(likeResponse.body.liked).toBe(true);
    expect(likeResponse.body.post.likes).toHaveLength(1);

    const unlikeResponse = await request(app)
      .put(`/api/posts/${postResponse.body._id}/like`)
      .set(authHeader(body.token));

    expect(unlikeResponse.status).toBe(200);
    expect(unlikeResponse.body.liked).toBe(false);
    expect(unlikeResponse.body.post.likes).toHaveLength(0);
  });

  it('follows and unfollows another user', async () => {
    const alice = await registerUser('alice', 'alice@example.com');
    const bob = await registerUser('bob', 'bob@example.com');

    const followResponse = await request(app)
      .put(`/api/users/${bob.body.user._id}/follow`)
      .set(authHeader(alice.body.token));

    expect(followResponse.status).toBe(200);
    expect(followResponse.body.currentUser.followingCount).toBe(1);
    expect(followResponse.body.targetUser.followersCount).toBe(1);

    const unfollowResponse = await request(app)
      .put(`/api/users/${bob.body.user._id}/unfollow`)
      .set(authHeader(alice.body.token));

    expect(unfollowResponse.status).toBe(200);
    expect(unfollowResponse.body.currentUser.followingCount).toBe(0);
    expect(unfollowResponse.body.targetUser.followersCount).toBe(0);
  });
});
