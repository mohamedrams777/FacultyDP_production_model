const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String },
  studentRollNo: { type: String },
  companyName: { type: String, required: true },
  companyAddress: { type: String },
  position: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: { type: Number }, // in weeks
  stipend: { type: Number },
  description: { type: String },
  skillsGained: [{ type: String }],
  projectTitle: { type: String },
  supervisorName: { type: String }, // Company supervisor
  status: { 
    type: String, 
    enum: ['ongoing', 'completed', 'terminated'], 
    default: 'ongoing' 
  },
  certificate: { type: String }, // Path to internship certificate
  report: { type: String }, // Path to internship report
  feedback: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Internship', internshipSchema);
