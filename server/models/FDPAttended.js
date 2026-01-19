const mongoose = require('mongoose');

const fdpAttendedSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  mode: { type: String, enum: ['online', 'offline'], required: true },
  duration: { type: String, required: true },
  venue: { type: String, required: true },
  reportUpload: { type: String },
  proofDoc: { type: String },
  certificate: { type: String }, // Certificate file path (PDF, JPG, PNG)
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FDPAttended', fdpAttendedSchema);
