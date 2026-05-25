const express = require('express');
const {
  addComment,
  createPost,
  deletePost,
  getFeed,
  getUserPosts,
  toggleLike,
  updatePost
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createPost);
router.get('/feed', getFeed);
router.get('/user/:userId', getUserPosts);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.put('/:id/like', toggleLike);
router.post('/:id/comment', addComment);

module.exports = router;
