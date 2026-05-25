const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

const cleanUser = (user) => {
  const safeUser = user.toObject ? user.toObject() : user;
  delete safeUser.password;
  return {
    ...safeUser,
    followersCount: safeUser.followers?.length || 0,
    followingCount: safeUser.following?.length || 0
  };
};

const listUsers = asyncHandler(async (req, res) => {
  const search = req.query.search?.trim();
  const query = {
    _id: { $ne: req.user._id }
  };

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(12);

  res.json(users.map(cleanUser));
});

const getCurrentProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(cleanUser(user));
});

const getProfileById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(cleanUser(user));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { username, email, bio, profilePicture } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (username && username !== user.username) {
    const taken = await User.findOne({ username, _id: { $ne: user._id } });
    if (taken) {
      res.status(409);
      throw new Error('Username already exists');
    }
    user.username = username;
  }

  if (email && email.toLowerCase() !== user.email) {
    const taken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
    if (taken) {
      res.status(409);
      throw new Error('Email already exists');
    }
    user.email = email;
  }

  if (typeof bio === 'string') user.bio = bio;
  if (typeof profilePicture === 'string') user.profilePicture = profilePicture;

  const saved = await user.save();
  res.json(cleanUser(saved));
});

const followUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;

  if (targetId === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot follow yourself');
  }

  const targetUser = await User.findById(targetId);

  if (!targetUser) {
    res.status(404);
    throw new Error('User not found');
  }

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: targetUser._id } });
  await User.findByIdAndUpdate(targetUser._id, { $addToSet: { followers: req.user._id } });

  const currentUser = await User.findById(req.user._id).select('-password');
  const followedUser = await User.findById(targetUser._id).select('-password');

  res.json({
    message: 'User followed',
    currentUser: cleanUser(currentUser),
    targetUser: cleanUser(followedUser)
  });
});

const unfollowUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;

  if (targetId === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot unfollow yourself');
  }

  const targetUser = await User.findById(targetId);

  if (!targetUser) {
    res.status(404);
    throw new Error('User not found');
  }

  await User.findByIdAndUpdate(req.user._id, { $pull: { following: targetUser._id } });
  await User.findByIdAndUpdate(targetUser._id, { $pull: { followers: req.user._id } });

  const currentUser = await User.findById(req.user._id).select('-password');
  const followedUser = await User.findById(targetUser._id).select('-password');

  res.json({
    message: 'User unfollowed',
    currentUser: cleanUser(currentUser),
    targetUser: cleanUser(followedUser)
  });
});

module.exports = {
  listUsers,
  getCurrentProfile,
  getProfileById,
  updateProfile,
  followUser,
  unfollowUser
};
