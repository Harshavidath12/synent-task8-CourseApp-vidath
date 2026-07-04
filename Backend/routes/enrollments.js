const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { protect } = require('../middlewares/auth');

// Create a mock payment and enroll user
router.post('/mock-payment-enroll', protect, async (req, res) => {
  const { courseId } = req.body;
  try {
    // Check if already enrolled
    const existing = await Enrollment.findOne({ userId: req.user._id, courseId });
    if (existing) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Generate a mock payment ID
    const mockPaymentId = 'mock_pay_' + Math.random().toString(36).substr(2, 9);

    const enrollment = await Enrollment.create({
      userId: req.user._id,
      courseId,
      mockPaymentId,
      status: 'active'
    });

    // Add course to user's enrolledCourses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { enrolledCourses: courseId }
    });

    res.status(201).json({ message: 'Successfully enrolled', enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update lesson progress
router.post('/progress/:enrollmentId', protect, async (req, res) => {
  const { lessonId } = req.body;
  try {
    const enrollment = await Enrollment.findOne({
      _id: req.params.enrollmentId,
      userId: req.user._id
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (!enrollment.progress.completedLessons.includes(lessonId)) {
      enrollment.progress.completedLessons.push(lessonId);
      await enrollment.save();
    }
    
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
