// User routes — profile fetch + update.
const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users — list all (for discover)
router.get('/', auth, async (req, res) => {
  const users = await User.find().select('-password').limit(50);
  res.json(users);
});

// GET /api/users/:id — profile + their posts
router.get('/:id', auth, async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  const posts = await Post.find({ author: user._id })
    .sort({ createdAt: -1 })
    .populate('author', 'username avatar');
  res.json({ user, posts });
});

// PUT /api/users/me — update own profile
router.put('/me/update', auth, async (req, res) => {
  const { bio, avatar, username } = req.body;
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: { bio, avatar, ...(username && { username }) } },
    { new: true }
  ).select('-password');
  res.json(user);
});

module.exports = router;
