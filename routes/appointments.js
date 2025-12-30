const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');

// @route   GET /api/appointments
// @desc    Get all appointments
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    let query = {};

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }

    // If not admin, only show own appointments
    if (req.user.role !== 'admin') {
      query.$or = [
        { createdBy: req.user.id },
        { 'attendees.user': req.user.id }
      ];
    }

    const appointments = await Appointment.find(query)
      .populate('property', 'title slug images location')
      .populate('lead', 'name email phone')
      .populate('createdBy', 'name email avatar')
      .populate('attendees.user', 'name email avatar')
      .sort('date startTime');

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/appointments/upcoming
// @desc    Get upcoming appointments
// @access  Private
router.get('/upcoming', protect, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = {
      date: { $gte: today },
      status: 'scheduled'
    };

    if (req.user.role !== 'admin') {
      query.$or = [
        { createdBy: req.user.id },
        { 'attendees.user': req.user.id }
      ];
    }

    const appointments = await Appointment.find(query)
      .populate('property', 'title slug images location')
      .populate('lead', 'name email phone')
      .sort('date startTime')
      .limit(10);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/appointments/today
// @desc    Get today's appointments
// @access  Private
router.get('/today', protect, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let query = {
      date: { $gte: today, $lt: tomorrow }
    };

    if (req.user.role !== 'admin') {
      query.$or = [
        { createdBy: req.user.id },
        { 'attendees.user': req.user.id }
      ];
    }

    const appointments = await Appointment.find(query)
      .populate('property', 'title slug images location')
      .populate('lead', 'name email phone')
      .populate('createdBy', 'name email avatar')
      .sort('startTime');

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('property', 'title slug images location price')
      .populate('lead', 'name email phone')
      .populate('createdBy', 'name email avatar phone')
      .populate('attendees.user', 'name email avatar');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    const appointment = await Appointment.create(req.body);

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('property', 'title slug images location')
      .populate('lead', 'name email phone')
      .populate('createdBy', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check ownership
    if (appointment.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('property', 'title slug images location')
      .populate('lead', 'name email phone')
      .populate('createdBy', 'name email avatar');

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Private
router.put('/:id/status', protect, async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['scheduled', 'completed', 'cancelled', 'rescheduled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check ownership
    if (appointment.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this appointment'
      });
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
