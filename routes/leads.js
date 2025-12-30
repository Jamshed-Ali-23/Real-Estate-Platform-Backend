const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const Property = require('../models/Property');
const { protect, authorize } = require('../middleware/auth');

// ===== PUBLIC ROUTES (No Auth Required) =====

// @route   POST /api/leads/public
// @desc    Create lead from contact form (public)
// @access  Public
router.post('/public', async (req, res, next) => {
  try {
    const { name, email, phone, message, propertyId, source, interestedIn } = req.body;

    const leadData = {
      name,
      email,
      phone,
      message,
      source: source || 'website',
      status: 'new',
      interestedIn: interestedIn || 'general'
    };

    // Link to property if provided
    if (propertyId) {
      leadData.property = propertyId;
    }

    const lead = await Lead.create(leadData);

    res.status(201).json({
      success: true,
      message: 'Thank you for your inquiry! We will contact you soon.',
      data: { id: lead._id }
    });
  } catch (err) {
    console.error('Lead creation error:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to submit inquiry'
    });
  }
});

// @route   POST /api/leads/listing
// @desc    Submit property listing request (sell/rent form)
// @access  Public
router.post('/listing', async (req, res, next) => {
  try {
    const {
      name, email, phone,
      propertyType, purpose, title, location, city,
      price, area, areaUnit, bedrooms, bathrooms, description,
      features, images
    } = req.body;

    // Create a pending property listing
    const propertyData = {
      title: title || `${propertyType} in ${city}`,
      description,
      price: Number(price),
      propertyType: propertyType.charAt(0).toUpperCase() + propertyType.slice(1),
      status: 'Pending',
      listingType: purpose === 'rent' ? 'rent' : 'sale',
      address: {
        city: city || location,
        state: location,
        country: 'USA'
      },
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      area: Number(area) || 0,
      features: features || [],
      images: images || []
    };

    const property = await Property.create(propertyData);

    // Create lead for follow-up
    const leadData = {
      name,
      email,
      phone,
      source: 'website',
      status: 'new',
      interestedIn: purpose === 'rent' ? 'renting' : 'selling',
      property: property._id,
      message: `Submitted ${purpose} listing: ${title || propertyType} in ${city || location}. Price: $${price}. Area: ${area} ${areaUnit}.`
    };

    await Lead.create(leadData);

    res.status(201).json({
      success: true,
      message: 'Your listing has been submitted for review!',
      data: { propertyId: property._id }
    });
  } catch (err) {
    console.error('Listing submission error:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to submit listing'
    });
  }
});

// ===== PROTECTED ROUTES =====

// @route   GET /api/leads
// @desc    Get all leads
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);

    // If not admin, only show assigned leads
    if (req.user.role !== 'admin') {
      reqQuery.assignedTo = req.user.id;
    }

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = Lead.find(JSON.parse(queryStr));

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.or([
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ]);
    }

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const total = await Lead.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate
    query = query.populate('assignedTo', 'name email avatar')
                 .populate('property', 'title slug price');

    const leads = await query;

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: leads
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/leads/stats
// @desc    Get lead statistics
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
  try {
    const matchQuery = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };

    const stats = await Lead.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalLeads = await Lead.countDocuments(matchQuery);
    const thisMonth = await Lead.countDocuments({
      ...matchQuery,
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        total: totalLeads,
        thisMonth
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/leads/:id
// @desc    Get single lead
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email avatar phone')
      .populate('property', 'title slug price images location');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && lead.assignedTo?._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this lead'
      });
    }

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/leads
// @desc    Create new lead
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    // Assign to current user if not specified
    if (!req.body.assignedTo) {
      req.body.assignedTo = req.user.id;
    }

    // Add initial activity
    req.body.activities = [{
      type: 'created',
      description: 'Lead created',
      performedBy: req.user.id
    }];

    const lead = await Lead.create(req.body);

    res.status(201).json({
      success: true,
      data: lead
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/leads/:id
// @desc    Update lead
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && lead.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead'
      });
    }

    // Track status change
    if (req.body.status && req.body.status !== lead.status) {
      if (!req.body.activities) {
        req.body.activities = lead.activities || [];
      }
      req.body.activities.push({
        type: 'status_change',
        description: `Status changed from ${lead.status} to ${req.body.status}`,
        performedBy: req.user.id
      });
    }

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (err) {
    next(err);
  }
});

// @route   PATCH /api/leads/:id/status
// @desc    Update lead status only
// @access  Private
router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && lead.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead'
      });
    }

    const oldStatus = lead.status;
    lead.status = status;
    await lead.save();

    res.status(200).json({
      success: true,
      data: lead,
      message: `Status changed from ${oldStatus} to ${status}`
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/leads/:id/activity
// @desc    Add activity to lead
// @access  Private
router.post('/:id/activity', protect, async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && lead.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead'
      });
    }

    const activity = {
      type: req.body.type || 'note',
      description: req.body.description,
      performedBy: req.user.id
    };

    lead.activities.push(activity);
    await lead.save();

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/leads/:id
// @desc    Delete lead
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    await lead.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
