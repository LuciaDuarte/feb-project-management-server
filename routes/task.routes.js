const router = require('express').Router();
const Project = require('../models/Project.model');
const Task = require('../models/Task.model');

// Create a new task
router.post('/tasks', async (req, res, next) => {
  const { title, description, projectId } = req.body;

  try {
    // Creating a new task
    const newTask = await Task.create({
      title,
      description,
      project: projectId
    });

    // Updating the project with the new task
    await Project.findByIdAndUpdate(projectId, {
      $push: { tasks: newTask._id }
    });

    // responding with the new task
    res.json(newTask);
  } catch (error) {
    console.log('An error occurred creating a new task', error);
    next(error);
  }
});

module.exports = router;
