const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// @route   GET /api/settings/profile
// @desc    Get user profile settings
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    // For demo purposes, return default agent data
    // In production, get from authenticated user
    const profile = {
      name: 'Johnson',
      title: 'Senior Real Estate Agent',
      email: 'johnson@realestate.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main Street, New York, NY 10001',
      bio: 'Experienced real estate professional with over 10 years of expertise in residential and commercial properties. Dedicated to finding the perfect property for every client.',
      avatar: '/images/agent.jpg',
      social: {
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com'
      },
      notifications: {
        emailNewLead: true,
        emailMessages: true,
        emailWeeklyReport: true,
        pushNewLead: true,
        pushMessages: true,
        pushAppointments: true,
        smsNewLead: false,
        smsAppointments: true
      },
      websiteSettings: {
        siteName: 'Johnson Realty',
        tagline: 'Your Trusted Real Estate Partner',
        primaryColor: '#6366f1',
        showFeaturedProperties: true,
        showTestimonials: true,
        showNewsletterSignup: true,
        enableChat: true,
        maintenanceMode: false
      }
    };

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// @route   PUT /api/settings/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      // In production, update authenticated user
      const updatedProfile = {
        ...req.body,
        updatedAt: new Date()
      };

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }
);

// @route   PUT /api/settings/notifications
// @desc    Update notification preferences
// @access  Private
router.put('/notifications', async (req, res) => {
  try {
    const notifications = req.body;

    // In production, update user's notification preferences in database
    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: notifications
    });

  } catch (error) {
    console.error('Update notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
});

// @route   PUT /api/settings/website
// @desc    Update website settings
// @access  Private/Admin
router.put('/website', async (req, res) => {
  try {
    const websiteSettings = req.body;

    // In production, update website settings in database
    res.json({
      success: true,
      message: 'Website settings updated successfully',
      data: websiteSettings
    });

  } catch (error) {
    console.error('Update website settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update website settings',
      error: error.message
    });
  }
});

// @route   PUT /api/settings/password
// @desc    Change password
// @access  Private
router.put(
  '/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage('Passwords do not match'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { currentPassword, newPassword } = req.body;

      // In production:
      // 1. Verify current password
      // 2. Hash new password
      // 3. Update user password in database

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: error.message
      });
    }
  }
);

// @route   GET /api/settings/stats
// @desc    Get account statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    // In production, calculate from database
    const stats = {
      totalProperties: 24,
      activeListings: 18,
      totalLeads: 156,
      convertedLeads: 42,
      totalAppointments: 89,
      completedAppointments: 67,
      accountAge: '2 years',
      lastLogin: new Date()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

module.exports = router;
