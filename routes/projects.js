const express = require("express");
const Project = require("../models/Project");
const Task = require("../models/Task");
const Comment = require("../models/Comment");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

const taskPopulate = [
  { path: "assignee", select: "_id name username email avatarUrl" },
  { path: "creator", select: "_id name username email avatarUrl" }
];

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function shapeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl
  };
}

function userIsMember(project, userId) {
  return project.members.some((member) => String(member._id || member) === String(userId));
}

async function findMemberProject(projectId, userId) {
  const project = await Project.findById(projectId).populate(
    "owner members",
    "_id name username email avatarUrl"
  );

  if (!project) {
    const error = new Error("Project not found.");
    error.statusCode = 404;
    throw error;
  }

  if (!userIsMember(project, userId)) {
    const error = new Error("You are not a member of this project.");
    error.statusCode = 403;
    throw error;
  }

  return project;
}

function shapeProject(project, tasks = []) {
  const plain = project.toObject();
  return {
    id: plain._id,
    name: plain.name,
    description: plain.description,
    owner: shapeUser(plain.owner),
    members: plain.members.map(shapeUser),
    taskCount: tasks.length,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt
  };
}

async function shapeTasks(tasks) {
  const taskIds = tasks.map((task) => task._id);
  const counts = taskIds.length
    ? await Comment.aggregate([
        { $match: { task: { $in: taskIds } } },
        { $group: { _id: "$task", count: { $sum: 1 } } }
      ])
    : [];
  const countMap = new Map(counts.map((item) => [String(item._id), item.count]));

  return tasks.map((task) => {
    const plain = task.toObject();
    return {
      id: plain._id,
      project: plain.project,
      title: plain.title,
      description: plain.description,
      status: plain.status,
      priority: plain.priority,
      dueDate: plain.dueDate,
      assignee: shapeUser(plain.assignee),
      creator: shapeUser(plain.creator),
      commentCount: countMap.get(String(plain._id)) || 0,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt
    };
  });
}

function shapeComment(comment) {
  const plain = comment.toObject();
  return {
    id: plain._id,
    task: plain.task,
    content: plain.content,
    author: shapeUser(plain.author),
    createdAt: plain.createdAt
  };
}

router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const projects = await Project.find({ members: req.user._id })
      .populate("owner members", "_id name username email avatarUrl")
      .sort({ updatedAt: -1 });

    const taskCounts = await Task.aggregate([
      { $match: { project: { $in: projects.map((project) => project._id) } } },
      { $group: { _id: "$project", count: { $sum: 1 } } }
    ]);
    const countMap = new Map(taskCounts.map((item) => [String(item._id), item.count]));

    res.json({
      projects: projects.map((project) => ({
        ...shapeProject(project),
        taskCount: countMap.get(String(project._id)) || 0
      }))
    });
  })
);

router.post(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const project = await Project.create({
      name: req.body.name,
      description: req.body.description,
      owner: req.user._id,
      members: [req.user._id]
    });

    await project.populate("owner members", "_id name username email avatarUrl");
    res.status(201).json({ project: shapeProject(project) });
  })
);

router.get(
  "/:projectId",
  auth,
  asyncHandler(async (req, res) => {
    const project = await findMemberProject(req.params.projectId, req.user._id);
    const tasks = await Task.find({ project: project._id })
      .populate(taskPopulate)
      .sort({ updatedAt: -1 });

    res.json({
      project: shapeProject(project, tasks),
      tasks: await shapeTasks(tasks)
    });
  })
);

router.post(
  "/:projectId/members",
  auth,
  asyncHandler(async (req, res) => {
    const project = await findMemberProject(req.params.projectId, req.user._id);
    const username = String(req.body.username || "").trim().toLowerCase();
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!userIsMember(project, user._id)) {
      project.members.push(user._id);
      await project.save();
    }

    await project.populate("owner members", "_id name username email avatarUrl");
    res.json({ project: shapeProject(project), message: "Member added." });
  })
);

router.post(
  "/:projectId/tasks",
  auth,
  asyncHandler(async (req, res) => {
    const project = await findMemberProject(req.params.projectId, req.user._id);
    const assignee = req.body.assignee || null;

    if (assignee && !userIsMember(project, assignee)) {
      return res.status(400).json({ message: "Assignee must be a project member." });
    }

    const task = await Task.create({
      project: project._id,
      title: req.body.title,
      description: req.body.description,
      status: req.body.status || "todo",
      priority: req.body.priority || "medium",
      dueDate: req.body.dueDate || null,
      assignee,
      creator: req.user._id
    });

    await task.populate(taskPopulate);
    const [shapedTask] = await shapeTasks([task]);
    res.status(201).json({ task: shapedTask });
  })
);

router.put(
  "/:projectId/tasks/:taskId",
  auth,
  asyncHandler(async (req, res) => {
    const project = await findMemberProject(req.params.projectId, req.user._id);
    const task = await Task.findOne({ _id: req.params.taskId, project: project._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const assignee = req.body.assignee === "" ? null : req.body.assignee;
    if (assignee && !userIsMember(project, assignee)) {
      return res.status(400).json({ message: "Assignee must be a project member." });
    }

    ["title", "description", "status", "priority", "dueDate"].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        task[field] = req.body[field] || (field === "dueDate" ? null : req.body[field]);
      }
    });
    if (Object.prototype.hasOwnProperty.call(req.body, "assignee")) {
      task.assignee = assignee || null;
    }

    await task.save();
    await task.populate(taskPopulate);
    const [shapedTask] = await shapeTasks([task]);
    res.json({ task: shapedTask });
  })
);

router.delete(
  "/:projectId/tasks/:taskId",
  auth,
  asyncHandler(async (req, res) => {
    const project = await findMemberProject(req.params.projectId, req.user._id);
    const task = await Task.findOne({ _id: req.params.taskId, project: project._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    await Comment.deleteMany({ task: task._id });
    await task.deleteOne();
    res.json({ message: "Task deleted." });
  })
);

router.get(
  "/:projectId/tasks/:taskId/comments",
  auth,
  asyncHandler(async (req, res) => {
    const project = await findMemberProject(req.params.projectId, req.user._id);
    const task = await Task.exists({ _id: req.params.taskId, project: project._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const comments = await Comment.find({ task: req.params.taskId })
      .populate("author", "_id name username email avatarUrl")
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ comments: comments.map(shapeComment) });
  })
);

router.post(
  "/:projectId/tasks/:taskId/comments",
  auth,
  asyncHandler(async (req, res) => {
    const project = await findMemberProject(req.params.projectId, req.user._id);
    const task = await Task.exists({ _id: req.params.taskId, project: project._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const comment = await Comment.create({
      task: req.params.taskId,
      author: req.user._id,
      content: req.body.content
    });

    await comment.populate("author", "_id name username email avatarUrl");
    res.status(201).json({ comment: shapeComment(comment) });
  })
);

module.exports = router;
