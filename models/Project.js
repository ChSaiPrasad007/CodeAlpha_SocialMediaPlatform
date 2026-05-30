const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required."],
      trim: true,
      minlength: [2, "Project name must be at least 2 characters."],
      maxlength: [80, "Project name must be 80 characters or fewer."]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [280, "Project description must be 280 characters or fewer."],
      default: ""
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

projectSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Project", projectSchema);
