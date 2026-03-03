const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['award', 'publication', 'research', 'patent', 'recognition', 'certification', 'conference', 'other'], 
    required: true 
  },
  patentType: { type: String, enum: ['design', 'utility', 'provisional', 'addition'] }, // Required when category is patent
  issuer: { type: String }, // Organization/Institute that issued the achievement
  date: { type: Date, required: true },
  certificate: { type: String, required: true }, // Path to certificate document - now mandatory
  supportingDocument: { type: String }, // Path to supporting document - optional
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
