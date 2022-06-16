const express = require("express");
const auth = require("../middleware/auth");
const Task = require("../models/tasks");

const router = new express.Router();

router.post("/task", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user.id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/task", auth, async (req, res) => {
  const user = req.user;
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    await user.populate([
      {
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseFloat(req.query.skip),
          sort,
        },
      },
    ]);
    res.send(user.tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send({ error: "Task not found" });
    }
    res.status(201).send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/updatetask/:id", auth, async (req, res) => {
  const task = Object.keys(req.body);
  const allowedTask = ["description", "completed"];
  const validateTask = task.every((task) => allowedTask.includes(task));

  if (!validateTask) {
    return res.status(400).send({ error: " You cannot update this task" });
  }

  try {
    const getTask = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    task.forEach((update) => (getTask[update] = req.body[update]));
    await getTask.save();

    if (!getTask) {
      res.status(404).send();
    }

    res.send(getTask);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/task/delete/:id", auth, async (req, res) => {
  try {
    const delTask = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!delTask) {
      return res.status(400).send({ error: "No such task here" });
    }
    res.send(delTask);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
