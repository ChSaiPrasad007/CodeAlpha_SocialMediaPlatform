// Post routes — feed, create, update, delete, like/unlike.
const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/posts — news feed (own + followed users)
router.get('/', auth, async (req, res) => {
  const me = await User.findById(req.userId);
  const ids = [req.userId, ...me.following];
  const posts = await Post.find({ author: { $in: ids } })
    .sort({ createdAt: -1 })
    .populate('author', 'username avatar')
    .populate({ path: 'comments', populate: { path: 'author', select: 'username avatar' } });
  res.json(posts);
});

// GET /api/posts/explore — all recent posts
router.get('/explore', auth, async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('author', 'username avatar');
  res.json(posts);
});

// POST /api/posts — create new post
router.post('/', auth, async (req, res) => {
  const { content, image } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ message: 'Content is required' });
  const post = await Post.create({ author: req.userId, content, image });
  const populated = await post.populate('author', 'username avatar');
  res.status(201).json(populated);
});

// PUT /api/posts/:id — edit own post
router.put('/:id', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.author.toString() !== req.userId) return res.status(403).json({ message: 'Not allowed' });
  post.content = req.body.content ?? post.content;
  post.image = req.body.image ?? post.image;
  await post.save();
  res.json(post);
});

// DELETE /api/posts/:id — delete own post
router.delete('/:id', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.author.toString() !== req.userId) return res.status(403).json({ message: 'Not allowed' });
  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();
  res.json({ message: 'Post deleted' });
});

// POST /api/posts/:id/like — toggle like
router.post('/:id/like', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const i = post.likes.findIndex((u) => u.toString() === req.userId);
  if (i >= 0) post.likes.splice(i, 1);
  else post.likes.push(req.userId);
  await post.save();
  res.json({ likes: post.likes.length, liked: i < 0 });
});

module.exports = router;
