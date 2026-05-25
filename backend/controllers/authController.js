const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'development-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Username, email, and password are required');
  }

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username }]
  });

  if (existingUser) {
    res.status(409);
    throw new Error('An account with this email or username already exists');
  }

  const user = await User.create({ username, email, password });

  res.status(201).json({
    token: createToken(user._id),
    user: user.toSafeObject()
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    token: createToken(user._id),
    user: user.toSafeObject()
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { register, login, getMe };
