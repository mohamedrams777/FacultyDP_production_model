const mongoose = require('mongoose');

const ablSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectName: { type: String, required: true },
  courseCode: { type: String, required: true },
  industryConnect: { type: String, required: true },
  proofDoc: { type: String, required: true }, // Made mandatory
  certificate: { type: String }, // Certificate upload field
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  calculatedDuration: { type: String }, // Will store "X days" or "X weeks"
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ABL', ablSchema);
