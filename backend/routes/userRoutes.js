const express = require('express');
const {
  followUser,
  getCurrentProfile,
  getProfileById,
  listUsers,
  unfollowUser,
  updateProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', listUsers);
router.get('/profile', getCurrentProfile);
router.get('/profile/:id', getProfileById);
router.put('/profile', updateProfile);
router.put('/:id/follow', followUser);
router.put('/:id/unfollow', unfollowUser);

module.exports = router;
