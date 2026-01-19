const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['award', 'publication', 'research', 'patent', 'recognition', 'certification', 'other'], 
    required: true 
  },
  issuer: { type: String }, // Organization/Institute that issued the achievement
  date: { type: Date, required: true },
  certificate: { type: String }, // Path to certificate document
  supportingDocument: { type: String }, // Path to supporting document
  link: { type: String }, // URL if applicable (e.g., publication link)
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'], 
    default: 'pending' 
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Achievement', achievementSchema);
