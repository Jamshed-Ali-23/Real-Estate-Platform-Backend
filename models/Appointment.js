const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide appointment title'],
    trim: true
  },
  type: {
    type: String,
    enum: ['viewing', 'meeting', 'open_house', 'follow_up', 'closing', 'inspection', 'other'],
    default: 'viewing'
  },
  description: String,
  // Date & Time
  date: {
    type: Date,
    required: [true, 'Please provide appointment date']
  },
  startTime: {
    type: String,
    required: [true, 'Please provide start time']
  },
  endTime: String,
  duration: {
    type: Number, // in minutes
    default: 60
  },
  // Related entities
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  // Client info (if not a lead)
  client: {
    name: String,
    email: String,
    phone: String
  },
  // Location
  location: {
    type: String,
    default: 'Property Address'
  },
  address: String,
  isVirtual: {
    type: Boolean,
    default: false
  },
  meetingLink: String,
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'],
    default: 'scheduled'
  },
  // Reminders
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderTime: {
    type: Number, // minutes before
    default: 60
  },
  // Notes
  notes: String,
  outcome: String,
  // Assignment
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Recurrence
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrence: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    endDate: Date
  }
}, {
  timestamps: true
});

// Index for date queries
appointmentSchema.index({ date: 1, agent: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
