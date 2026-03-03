const mongoose = require('mongoose');

const upcomingEventSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventName: { type: String, required: true },
  venue: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: { type: Number }, // Calculated duration
  durationUnit: { type: String, enum: ['days', 'weeks'] }, // Duration unit
  description: { type: String },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed'], 
    default: 'upcoming' 
  },
  notificationSent: { type: Boolean, default: false }, // Track if 24hr notification sent
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UpcomingEvent', upcomingEventSchema);
