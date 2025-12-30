const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    lowercase: true
  },
  phone: String,
  subject: {
    type: String,
    enum: ['buying', 'selling', 'renting', 'general', 'feedback'],
    default: 'general'
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new'
  },
  repliedAt: Date,
  archivedAt: Date,
  // For tracking
  source: {
    page: String,
    referrer: String,
    userAgent: String,
    ip: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ContactSubmission', contactSubmissionSchema);
