const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'zillow', 'realtor', 'open_house', 'cold_call', 'other'],
    default: 'website'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'negotiating', 'closed', 'lost'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Interest
  interestedIn: {
    type: String,
    enum: ['buying', 'selling', 'renting', 'investing', 'general'],
    default: 'buying'
  },
  budget: {
    min: Number,
    max: Number
  },
  preferredPropertyType: [String],
  preferredLocations: [String],
  timeline: {
    type: String,
    enum: ['immediate', '1-3_months', '3-6_months', '6-12_months', 'just_browsing'],
    default: 'just_browsing'
  },
  // Related Property (if inquiry from property page)
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  // Notes & History
  message: String,
  notes: [{
    content: String,
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  // Activity tracking
  lastContactedAt: Date,
  nextFollowUpAt: Date,
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Tags
  tags: [String],
  // Conversion
  convertedAt: Date,
  lostReason: String
}, {
  timestamps: true
});

// Index for search
leadSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
