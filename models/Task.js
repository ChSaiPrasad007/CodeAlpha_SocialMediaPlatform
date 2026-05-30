const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, "Task title is required."],
      trim: true,
      minlength: [2, "Task title must be at least 2 characters."],
      maxlength: [120, "Task title must be 120 characters or fewer."]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [700, "Task description must be 700 characters or fewer."],
      default: ""
    },
    status: {
      type: String,
      enum: ["todo", "progress", "review", "done"],
      default: "todo",
      index: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    dueDate: {
      type: Date,
      default: null
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ project: 1, status: 1, updatedAt: -1 });

module.exports = mongoose.model("Task", taskSchema);
