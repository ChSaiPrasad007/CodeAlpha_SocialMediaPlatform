const express = require("express");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function shapeComment(comment, viewerId) {
  const plain = comment.toObject();
  return {
    id: plain._id,
    post: plain.post,
    content: plain.content,
    author: {
      id: plain.author._id,
      name: plain.author.name,
      username: plain.author.username,
      avatarUrl: plain.author.avatarUrl
    },
    canDelete: String(plain.author._id) === String(viewerId),
    createdAt: plain.createdAt
  };
}

router.get(
  "/posts/:postId/comments",
  auth,
  asyncHandler(async (req, res) => {
    const post = await Post.exists({ _id: req.params.postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "_id name username avatarUrl")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      comments: comments.map((comment) => shapeComment(comment, req.user._id))
    });
  })
);

router.post(
  "/posts/:postId/comments",
  auth,
  asyncHandler(async (req, res) => {
    const post = await Post.exists({ _id: req.params.postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const comment = await Comment.create({
      post: req.params.postId,
      author: req.user._id,
      content: req.body.content
    });

    await comment.populate("author", "_id name username avatarUrl");
    res.status(201).json({ comment: shapeComment(comment, req.user._id) });
  })
);

router.delete(
  "/comments/:id",
  auth,
  asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const post = await Post.findById(comment.post).select("author");
    const canDelete =
      String(comment.author) === String(req.user._id) ||
      (post && String(post.author) === String(req.user._id));

    if (!canDelete) {
      return res.status(403).json({ message: "You cannot delete this comment." });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted." });
  })
);

module.exports = router;
