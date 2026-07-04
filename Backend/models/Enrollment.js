const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  progress: {
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }]
  },
  mockPaymentId: { type: String } // Storing mock payment ID instead of Razorpay
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
