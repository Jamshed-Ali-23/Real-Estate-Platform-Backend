const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a property title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [5000, 'Description cannot be more than 5000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price']
  },
  propertyType: {
    type: String,
    required: [true, 'Please specify property type'],
    enum: ['House', 'Apartment', 'Villa', 'Penthouse', 'Condo', 'Townhouse', 'Land', 'Commercial', 'Estate', 'Plot', 'Office', 'Shop', 'Warehouse', 'Room', 'Studio', 'Farmhouse', 'house', 'apartment', 'villa', 'penthouse', 'condo', 'townhouse', 'land', 'commercial', 'estate', 'plot', 'office', 'shop', 'warehouse', 'room', 'studio', 'farmhouse']
  },
  status: {
    type: String,
    enum: ['For Sale', 'For Rent', 'Sold', 'Pending', 'Off Market', 'active', 'pending', 'sold'],
    default: 'For Sale'
  },
  listingType: {
    type: String,
    enum: ['sale', 'rent'],
    default: 'sale'
  },
  featured: {
    type: Boolean,
    default: false
  },
  // Location
  address: {
    street: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: String,
    country: { type: String, default: 'Pakistan' }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  // Property Details
  bedrooms: {
    type: Number,
    required: [true, 'Please specify number of bedrooms']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Please specify number of bathrooms']
  },
  area: {
    type: Number,
    required: [true, 'Please specify property area in sqft']
  },
  lotSize: Number,
  yearBuilt: Number,
  parking: {
    type: Number,
    default: 0
  },
  // Features & Amenities
  features: [{
    type: String
  }],
  amenities: [{
    type: String
  }],
  // Media
  images: [{
    type: String  // Allow simple string URLs
  }],
  virtualTour: {
    enabled: { type: Boolean, default: false },
    url: String
  },
  video: {
    url: String,
    thumbnail: String
  },
  // Additional Info
  hoaFee: Number,
  taxAmount: Number,
  mlsNumber: String,
  // Stats
  views: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  // Relations
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Optional for seeding
  },
  // SEO
  slug: {
    type: String,
    sparse: true  // Allow nulls but ensure uniqueness for non-null values
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from title before saving
propertySchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + this._id;
  }
  next();
});

// Virtual for formatted address
propertySchema.virtual('fullAddress').get(function() {
  const { street, city, state, zipCode } = this.address;
  return [street, city, state, zipCode].filter(Boolean).join(', ');
});

// Virtual for price per sqft
propertySchema.virtual('pricePerSqft').get(function() {
  return this.area > 0 ? Math.round(this.price / this.area) : 0;
});

// Index for search
propertySchema.index({ title: 'text', description: 'text', 'address.city': 'text' });

module.exports = mongoose.model('Property', propertySchema);
