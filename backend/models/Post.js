const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      trim: true,
      maxlength: [1200, 'Post content cannot exceed 1200 characters']
    },
    image: {
      type: String,
      default: ''
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ]
  },
  { timestamps: true }
);

postSchema.pre('validate', function requireContentOrImage(next) {
  if (!this.content && !this.image) {
    return next(new Error('Post content or image is required'));
  }
  return next();
});

module.exports = mongoose.model('Post', postSchema);
