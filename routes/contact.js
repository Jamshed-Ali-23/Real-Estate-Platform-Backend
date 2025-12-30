const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const ContactSubmission = require('../models/ContactSubmission');
const nodemailer = require('nodemailer');

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('inquiryType').trim().notEmpty().withMessage('Inquiry type is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { name, email, phone, inquiryType, propertyId, message } = req.body;

      // Create contact submission
      const contact = await ContactSubmission.create({
        name,
        email,
        phone,
        inquiryType,
        propertyId,
        message,
        status: 'new'
      });

      // Send notification email (optional - configure SMTP in .env)
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
            to: process.env.SMTP_USER,
            subject: `New Contact Form Submission - ${inquiryType}`,
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
              <p><strong>Message:</strong></p>
              <p>${message}</p>
            `,
          });
        } catch (emailError) {
          console.error('Email notification failed:', emailError.message);
          // Don't fail the request if email fails
        }
      }

      res.status(201).json({
        success: true,
        message: 'Contact form submitted successfully',
        data: contact
      });

    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit contact form',
        error: error.message
      });
    }
  }
);

// @route   GET /api/contact
// @desc    Get all contact submissions (admin only)
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const contacts = await ContactSubmission.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('propertyId', 'title');

    const total = await ContactSubmission.countDocuments(query);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submissions',
      error: error.message
    });
  }
});

// @route   PUT /api/contact/:id
// @desc    Update contact submission status
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const contact = await ContactSubmission.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact submission',
      error: error.message
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact submission
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const contact = await ContactSubmission.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact submission deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact submission',
      error: error.message
    });
  }
});

module.exports = router;
