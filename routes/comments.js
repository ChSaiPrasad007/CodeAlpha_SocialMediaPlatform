// Comment routes — add and delete comments on a post.
const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/comments/:postId — add comment
router.post('/:postId', auth, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ message: 'Text is required' });

  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const comment = await Comment.create({ post: post._id, author: req.userId, text });
  post.comments.push(comment._id);
  await post.save();

  const populated = await comment.populate('author', 'username avatar');
  res.status(201).json(populated);
});

// DELETE /api/comments/:id — delete own comment
router.delete('/:id', auth, async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  if (comment.author.toString() !== req.userId) return res.status(403).json({ message: 'Not allowed' });
  await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
  await comment.deleteOne();
  res.json({ message: 'Comment deleted' });
});

module.exports = router;
