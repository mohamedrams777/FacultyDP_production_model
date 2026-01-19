const mongoose = require('mongoose');

const jointTeachingSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseName: { type: String, required: true },
  courseCode: { type: String, required: true },
  facultyInvolved: { type: String, required: true },
  syllabusDoc: { type: String },
  certificate: { type: String }, // Certificate file path
  hours: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('JointTeaching', jointTeachingSchema);
