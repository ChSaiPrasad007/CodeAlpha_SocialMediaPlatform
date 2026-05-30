const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: [true, "Comment content is required."],
      trim: true,
      minlength: [1, "Comment cannot be empty."],
      maxlength: [240, "Comments must be 240 characters or fewer."]
    }
  },
  {
    timestamps: true
  }
);

commentSchema.index({ task: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
