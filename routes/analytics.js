const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Lead = require('../models/Lead');
const Appointment = require('../models/Appointment');
const { Conversation } = require('../models/Message');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    const matchQuery = req.user.role === 'admin' ? {} : { agent: req.user._id };
    const leadMatchQuery = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };

    // Get date ranges
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Properties count
    const totalProperties = await Property.countDocuments(matchQuery);
    const availableProperties = await Property.countDocuments({ ...matchQuery, status: 'available' });
    const soldProperties = await Property.countDocuments({ ...matchQuery, status: 'sold' });
    const rentedProperties = await Property.countDocuments({ ...matchQuery, status: 'rented' });

    // Leads count
    const totalLeads = await Lead.countDocuments(leadMatchQuery);
    const newLeads = await Lead.countDocuments({ 
      ...leadMatchQuery, 
      createdAt: { $gte: startOfMonth } 
    });
    const qualifiedLeads = await Lead.countDocuments({ 
      ...leadMatchQuery, 
      status: 'qualified' 
    });

    // Appointments
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    const todayAppointments = await Appointment.countDocuments({
      createdBy: req.user._id,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    const upcomingAppointments = await Appointment.countDocuments({
      createdBy: req.user._id,
      date: { $gte: new Date() },
      status: 'scheduled'
    });

    // Property views (total)
    const viewsAggregation = await Property.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewsAggregation[0]?.totalViews || 0;

    // Unread messages
    const conversations = await Conversation.find({
      participants: req.user._id
    });
    let unreadMessages = 0;
    conversations.forEach(conv => {
      unreadMessages += conv.unreadCount?.get(req.user._id.toString()) || 0;
    });

    // Lead conversion rate
    const wonLeads = await Lead.countDocuments({ ...leadMatchQuery, status: 'won' });
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;

    // Month over month comparison
    const lastMonthLeads = await Lead.countDocuments({
      ...leadMatchQuery,
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });
    const leadGrowth = lastMonthLeads > 0 
      ? (((newLeads - lastMonthLeads) / lastMonthLeads) * 100).toFixed(1) 
      : 100;

    res.status(200).json({
      success: true,
      data: {
        properties: {
          total: totalProperties,
          available: availableProperties,
          sold: soldProperties,
          rented: rentedProperties
        },
        leads: {
          total: totalLeads,
          new: newLeads,
          qualified: qualifiedLeads,
          conversionRate: parseFloat(conversionRate),
          growth: parseFloat(leadGrowth)
        },
        appointments: {
          today: todayAppointments,
          upcoming: upcomingAppointments
        },
        engagement: {
          totalViews,
          unreadMessages
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/analytics/properties
// @desc    Get property analytics
// @access  Private
router.get('/properties', protect, async (req, res, next) => {
  try {
    const matchQuery = req.user.role === 'admin' ? {} : { agent: req.user._id };

    // Properties by type
    const byType = await Property.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$propertyType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Properties by status
    const byStatus = await Property.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Properties by purpose
    const byPurpose = await Property.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$purpose', count: { $sum: 1 } } }
    ]);

    // Price distribution
    const priceRanges = await Property.aggregate([
      { $match: matchQuery },
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 100000, 250000, 500000, 750000, 1000000, 2000000, Infinity],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    // Top viewed properties
    const topViewed = await Property.find(matchQuery)
      .select('title slug views images price location')
      .sort('-views')
      .limit(5);

    // Monthly listings
    const monthlyListings = await Property.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byType,
        byStatus,
        byPurpose,
        priceRanges,
        topViewed,
        monthlyListings
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/analytics/leads
// @desc    Get lead analytics
// @access  Private
router.get('/leads', protect, async (req, res, next) => {
  try {
    const matchQuery = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };

    // Leads by status (pipeline)
    const byStatus = await Lead.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Leads by source
    const bySource = await Lead.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly leads
    const monthlyLeads = await Lead.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Lead response time (average)
    const leadsWithFirstContact = await Lead.find({
      ...matchQuery,
      'activities.type': 'call'
    }).select('createdAt activities');

    let totalResponseTime = 0;
    let contactedLeads = 0;

    leadsWithFirstContact.forEach(lead => {
      const firstCall = lead.activities.find(a => a.type === 'call');
      if (firstCall) {
        const responseTime = new Date(firstCall.createdAt) - new Date(lead.createdAt);
        totalResponseTime += responseTime;
        contactedLeads++;
      }
    });

    const avgResponseTime = contactedLeads > 0 
      ? Math.round(totalResponseTime / contactedLeads / (1000 * 60 * 60)) // in hours
      : 0;

    res.status(200).json({
      success: true,
      data: {
        byStatus,
        bySource,
        monthlyLeads,
        avgResponseTime
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/analytics/revenue
// @desc    Get revenue analytics (for sold/rented properties)
// @access  Private (Admin)
router.get('/revenue', protect, authorize('admin'), async (req, res, next) => {
  try {
    // Revenue by month
    const monthlyRevenue = await Property.aggregate([
      { $match: { status: { $in: ['sold', 'rented'] } } },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' }
          },
          revenue: { $sum: '$price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Total revenue
    const totalRevenue = await Property.aggregate([
      { $match: { status: { $in: ['sold', 'rented'] } } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    // Revenue by property type
    const byType = await Property.aggregate([
      { $match: { status: { $in: ['sold', 'rented'] } } },
      { 
        $group: { 
          _id: '$propertyType', 
          revenue: { $sum: '$price' },
          count: { $sum: 1 }
        } 
      },
      { $sort: { revenue: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        monthlyRevenue,
        totalRevenue: totalRevenue[0]?.total || 0,
        byType
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
