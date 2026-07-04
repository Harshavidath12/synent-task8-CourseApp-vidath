const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String }, // YouTube embed URL
  content: { type: String }, // Optional text content
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
