const express = require("express");
const User = require("../models/User");
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
    email: user.email,
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
  "/search",
  auth,
  asyncHandler(async (req, res) => {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.json({ users: [] });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } }
      ]
    })
      .select("_id name username bio avatarUrl")
      .limit(12);

    res.json({ users: users.map(shapeUser) });
  })
);

router.get(
  "/:username",
  auth,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({
      username: String(req.params.username).toLowerCase()
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const [followersCount, followingCount, postsCount, isFollowing] =
      await Promise.all([
        Follow.countDocuments({ following: user._id }),
        Follow.countDocuments({ follower: user._id }),
        Post.countDocuments({ author: user._id }),
        Follow.exists({ follower: req.user._id, following: user._id })
      ]);

    res.json({
      user: {
        ...shapeUser(user),
        followersCount,
        followingCount,
        postsCount,
        isFollowing: Boolean(isFollowing),
        isMe: String(user._id) === String(req.user._id)
      }
    });
  })
);

router.get(
  "/:username/posts",
  auth,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({
      username: String(req.params.username).toLowerCase()
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const posts = await Post.find({ author: user._id })
      .populate("author", "_id name username bio avatarUrl createdAt")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ posts: await shapePosts(posts, req.user._id) });
  })
);

router.post(
  "/:id/follow",
  auth,
  asyncHandler(async (req, res) => {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: "User not found." });
    }

    await Follow.findOneAndUpdate(
      {
        follower: req.user._id,
        following: target._id
      },
      {
        follower: req.user._id,
        following: target._id
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    const followersCount = await Follow.countDocuments({ following: target._id });
    res.json({ message: "User followed.", followersCount, isFollowing: true });
  })
);

router.delete(
  "/:id/follow",
  auth,
  asyncHandler(async (req, res) => {
    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: "User not found." });
    }

    await Follow.findOneAndDelete({
      follower: req.user._id,
      following: target._id
    });

    const followersCount = await Follow.countDocuments({ following: target._id });
    res.json({ message: "User unfollowed.", followersCount, isFollowing: false });
  })
);

module.exports = router;
