const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { protect } = require('../middlewares/auth');

// Get user profile & enrolled courses
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('enrolledCourses');
    if (user) {
      // Get detailed enrollments for progress
      const enrollments = await Enrollment.find({ userId: req.user._id }).populate('courseId');
      res.json({ user, enrollments });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get enrolled course details for learning interface
router.get('/enrolled-course/:courseId', protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      courseId: req.params.courseId
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
