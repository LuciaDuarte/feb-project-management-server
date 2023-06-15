const router = require('express').Router();
const Project = require('../models/Project.model');
const mongoose = require('mongoose');
const fileUploader = require('../config/cloudinary.config');

// Create a new project
router.post('/projects', async (req, res, next) => {
  const { title, description, imgUrl } = req.body;

  try {
    const newProject = await Project.create({
      title,
      description,
      imgUrl,
      tasks: []
    });
    res.json(newProject);
  } catch (error) {
    console.log('An error occurred creating a new project', error);
    next(error);
  }
});

// Retrieves all projects
router.get('/projects', async (req, res, next) => {
  try {
    // we need to 'populate' tasks to get all the info related to tasks
    const allProjects = await Project.find().populate('tasks');
    res.json(allProjects);
  } catch (error) {
    console.log('An error occurred getting all the projects', error);
    next(error);
  }
});

// Retrieves a specific project by id
router.get('/projects/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    // check if provided id is a valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Specified id is not valid' });
    }

    const project = await Project.findById(id).populate('tasks');

    // notify if no project was found
    if (!project) {
      return res
        .status(404)
        .json({ message: 'No project found with specified id' });
    }

    res.json(project);
  } catch (error) {
    console.log('An error occurred getting the project', error);
    next(error);
  }
});

// Updates a specific project by id
router.put('/projects/:id', async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    // check if provided id is a valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Specified id is not valid' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        title,
        description
      },
      { new: true } // the need to pass this to receive the updated object
    ).populate('tasks');

    // notify if no project was found
    if (!updatedProject) {
      return res
        .status(404)
        .json({ message: 'No project found with specified id' });
    }

    res.json(updatedProject);
  } catch (error) {
    console.log('An error occurred updating the project', error);
    next(error);
  }
});

// Deletes the specified project by id
router.delete('/projects/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    // check if provided id is a valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Specified id is not valid' });
    }

    await Project.findByIdAndDelete(id);
    res.json({ message: `Project with ${id} was removed successfully.` });
  } catch (error) {
    console.log('An error occurred deleting the project', error);
    next(error);
  }
});

// Route that receives the image, sends it to Cloudinary
// via the fileUploader and returns the image URL
router.post('/upload', fileUploader.single('file'), (req, res) => {
  try {
    res.status(200).json({ imgUrl: req.file.path });
  } catch (error) {
    res.status(500).status({
      message: `An error occurred while uploading the image - ${error.message}`
    });
  }
});

module.exports = router;
