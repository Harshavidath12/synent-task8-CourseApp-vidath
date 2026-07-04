const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const { protect, adminOnly } = require('../middlewares/auth');

// Get all courses (Public)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({}).populate('createdBy', 'username');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single course details (Public)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      const modules = await Module.find({ courseId: course._id }).populate('lessons');
      res.json({ course, modules });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Create Course
router.post('/', protect, adminOnly, async (req, res) => {
  const { title, description, price, thumbnail } = req.body;
  try {
    const course = await Course.create({
      title, description, price, thumbnail, createdBy: req.user._id
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Add Module to Course
router.post('/:courseId/modules', protect, adminOnly, async (req, res) => {
  const { title } = req.body;
  try {
    const module = await Module.create({
      title, courseId: req.params.courseId
    });
    res.status(201).json(module);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Add Lesson to Module
router.post('/modules/:moduleId/lessons', protect, adminOnly, async (req, res) => {
  const { title, videoUrl, content } = req.body;
  try {
    const lesson = await Lesson.create({
      title, videoUrl, content, moduleId: req.params.moduleId
    });
    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
