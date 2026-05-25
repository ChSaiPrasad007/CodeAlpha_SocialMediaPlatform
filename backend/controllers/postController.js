const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { asyncHandler } = require('../middleware/errorHandler');

const postPopulate = [
  { path: 'user', select: 'username email profilePicture bio followers following' },
  {
    path: 'comments',
    populate: { path: 'user', select: 'username profilePicture' },
    options: { sort: { createdAt: -1 } }
  }
];

const populatePost = (query) => query.populate(postPopulate);

const createPost = asyncHandler(async (req, res) => {
  const { content, image } = req.body;

  const post = await Post.create({
    user: req.user._id,
    content,
    image
  });

  const populated = await populatePost(Post.findById(post._id));
  res.status(201).json(populated);
});

const getFeed = asyncHandler(async (req, res) => {
  const posts = await populatePost(Post.find({}).sort({ createdAt: -1 }).limit(100));
  res.json(posts);
});

const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await populatePost(
    Post.find({ user: req.params.userId }).sort({ createdAt: -1 }).limit(100)
  );
  res.json(posts);
});

const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only edit your own posts');
  }

  if (typeof req.body.content === 'string') post.content = req.body.content;
  if (typeof req.body.image === 'string') post.image = req.body.image;

  await post.save();
  const populated = await populatePost(Post.findById(post._id));
  res.json(populated);
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only delete your own posts');
  }

  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  res.json({ message: 'Post deleted', postId: req.params.id });
});

const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const liked = post.likes.some((id) => id.toString() === req.user._id.toString());

  if (liked) {
    post.likes.pull(req.user._id);
  } else {
    post.likes.addToSet(req.user._id);
  }

  await post.save();
  const populated = await populatePost(Post.findById(post._id));

  res.json({
    liked: !liked,
    post: populated
  });
});

const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const comment = await Comment.create({
    user: req.user._id,
    post: post._id,
    text
  });

  post.comments.addToSet(comment._id);
  await post.save();

  const populated = await populatePost(Post.findById(post._id));
  res.status(201).json(populated);
});

module.exports = {
  createPost,
  getFeed,
  getUserPosts,
  updatePost,
  deletePost,
  toggleLike,
  addComment
};
