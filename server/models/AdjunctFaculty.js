const mongoose = require('mongoose');

const adjunctFacultySchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facultyName: { type: String, required: true },
  department: { type: String, required: true },
  courseCode: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  durationType: { type: String, enum: ['days', 'weeks'], required: true },
  certificate: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AdjunctFaculty', adjunctFacultySchema);
