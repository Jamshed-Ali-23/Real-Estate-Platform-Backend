const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// @route   GET /api/properties
// @desc    Get all properties with filtering, sorting, pagination
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string for operators
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Base query
    query = Property.find(JSON.parse(queryStr));

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.or([
        { title: searchRegex },
        { description: searchRegex },
        { 'location.address': searchRegex },
        { 'location.city': searchRegex }
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
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Property.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate agent
    query = query.populate('agent', 'name email phone avatar');

    // Execute query
    const properties = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }

    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      pagination,
      data: properties
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/properties/featured
// @desc    Get featured properties
// @access  Public
router.get('/featured', async (req, res, next) => {
  try {
    const properties = await Property.find({ isFeatured: true, status: 'available' })
      .populate('agent', 'name email phone avatar')
      .limit(6)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property
// @access  Public
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('agent', 'name email phone avatar bio');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/properties/slug/:slug
// @desc    Get property by slug
// @access  Public
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const property = await Property.findOne({ slug: req.params.slug })
      .populate('agent', 'name email phone avatar bio');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/properties
// @desc    Create new property
// @access  Private (Agent/Admin)
router.post('/', protect, authorize('agent', 'admin'), async (req, res, next) => {
  try {
    // Add agent to req.body
    req.body.agent = req.user.id;

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private (Owner/Admin)
router.put('/:id', protect, authorize('agent', 'admin'), async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Make sure user is property owner or admin
    if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private (Owner/Admin)
router.delete('/:id', protect, authorize('agent', 'admin'), async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Make sure user is property owner or admin
    if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/properties/agent/:agentId
// @desc    Get properties by agent
// @access  Public
router.get('/agent/:agentId', async (req, res, next) => {
  try {
    const properties = await Property.find({ agent: req.params.agentId })
      .populate('agent', 'name email phone avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
