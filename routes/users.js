const express = require("express");
const User = require("../models/User");
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

module.exports = router;
