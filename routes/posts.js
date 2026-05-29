const express = require("express");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Follow = require("../models/Follow");
const auth = require("../middleware/auth");

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function shapeUser(user) {
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt
  };
}

async function shapePosts(posts, viewerId) {
  const postIds = posts.map((post) => post._id);
  const commentCounts = await Comment.aggregate([
    { $match: { post: { $in: postIds } } },
    { $group: { _id: "$post", count: { $sum: 1 } } }
  ]);
  const countMap = new Map(
    commentCounts.map((item) => [String(item._id), item.count])
  );

  return posts.map((post) => {
    const plain = post.toObject();
    return {
      id: plain._id,
      content: plain.content,
      author: shapeUser(plain.author),
      likeCount: plain.likes.length,
      likedByMe: plain.likes.some((id) => String(id) === String(viewerId)),
      commentCount: countMap.get(String(plain._id)) || 0,
      canEdit: String(plain.author._id) === String(viewerId),
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt
    };
  });
}

router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const follows = await Follow.find({ follower: req.user._id }).select(
      "following"
    );
    const visibleAuthors = [
      req.user._id,
      ...follows.map((follow) => follow.following)
    ];

    const posts = await Post.find({ author: { $in: visibleAuthors } })
      .populate("author", "_id name username bio avatarUrl createdAt")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ posts: await shapePosts(posts, req.user._id) });
  })
);

router.post(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const post = await Post.create({
      author: req.user._id,
      content: req.body.content
    });

    const populatedPost = await post.populate(
      "author",
      "_id name username bio avatarUrl createdAt"
    );

    const [shapedPost] = await shapePosts([populatedPost], req.user._id);
    res.status(201).json({ post: shapedPost });
  })
);

router.put(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can edit only your posts." });
    }

    post.content = req.body.content;
    await post.save();

    await post.populate("author", "_id name username bio avatarUrl createdAt");
    const [shapedPost] = await shapePosts([post], req.user._id);
    res.json({ post: shapedPost });
  })
);

router.delete(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can delete only your posts." });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: "Post deleted." });
  })
);

router.post(
  "/:id/like",
  auth,
  asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    ).populate("author", "_id name username bio avatarUrl createdAt");

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const [shapedPost] = await shapePosts([post], req.user._id);
    res.json({ post: shapedPost });
  })
);

router.delete(
  "/:id/like",
  auth,
  asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: req.user._id } },
      { new: true }
    ).populate("author", "_id name username bio avatarUrl createdAt");

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const [shapedPost] = await shapePosts([post], req.user._id);
    res.json({ post: shapedPost });
  })
);

module.exports = router;
