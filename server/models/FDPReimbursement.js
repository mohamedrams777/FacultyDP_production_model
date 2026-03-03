const mongoose = require('mongoose');

const fdpReimbursementSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fdpId: { type: mongoose.Schema.Types.ObjectId, ref: 'FDPAttended', required: true },
  fdpTitle: { type: String, required: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'INR' },
  expenseType: { 
    type: String, 
    enum: ['travel', 'accommodation', 'registration', 'food', 'other'], 
    required: true 
  },
  otherExpenseType: { type: String }, // For when expenseType is 'other'
  description: { type: String },
  receiptDocument: { type: String, required: true }, // Make receipt mandatory
  bankDetails: {
    accountNumber: { type: String, required: true }, // Make account number required
    ifscCode: { type: String },
    bankName: { type: String },
    accountHolderName: { type: String },
    bankBranch: { type: String }, // Add bank branch field
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'processed'], 
    default: 'pending' 
  },
  submittedDate: { type: Date, default: Date.now },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedDate: { type: Date },
  reviewComments: { type: String },
  processedDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FDPReimbursement', fdpReimbursementSchema);
