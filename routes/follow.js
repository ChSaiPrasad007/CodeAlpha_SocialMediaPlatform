// Follow routes — follow/unfollow another user.
const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/follow/:id — toggle follow
router.post('/:id', auth, async (req, res) => {
  if (req.params.id === req.userId)
    return res.status(400).json({ message: "You can't follow yourself" });

  const target = await User.findById(req.params.id);
  const me = await User.findById(req.userId);
  if (!target) return res.status(404).json({ message: 'User not found' });

  const isFollowing = me.following.some((u) => u.toString() === target._id.toString());
  if (isFollowing) {
    me.following.pull(target._id);
    target.followers.pull(me._id);
  } else {
    me.following.push(target._id);
    target.followers.push(me._id);
  }
  await me.save();
  await target.save();

  res.json({
    following: !isFollowing,
    followersCount: target.followers.length,
  });
});

module.exports = router;
