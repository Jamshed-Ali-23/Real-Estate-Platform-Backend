const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { 
  uploadAvatar, 
  uploadPropertyImages, 
  uploadPropertyFiles,
  uploadDocument 
} = require('../middleware/upload');

// Ensure upload directories exist
const uploadDirs = ['uploads/avatars', 'uploads/properties', 'uploads/floorplans', 'uploads/documents', 'uploads/misc'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// @route   POST /api/upload/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', protect, uploadAvatar, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        path: `/uploads/avatars/${req.file.filename}`,
        url: `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/upload/property-images
// @desc    Upload property images (multiple)
// @access  Private
router.post('/property-images', protect, uploadPropertyImages, async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/properties/${file.filename}`,
      url: `${req.protocol}://${req.get('host')}/uploads/properties/${file.filename}`,
      size: file.size
    }));

    res.status(200).json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/upload/property-files
// @desc    Upload property files (images, floor plans, documents)
// @access  Private
router.post('/property-files', protect, uploadPropertyFiles, async (req, res, next) => {
  try {
    const result = {
      propertyImages: [],
      floorPlan: [],
      document: []
    };

    if (req.files) {
      if (req.files.propertyImages) {
        result.propertyImages = req.files.propertyImages.map(file => ({
          filename: file.filename,
          path: `/uploads/properties/${file.filename}`,
          url: `${req.protocol}://${req.get('host')}/uploads/properties/${file.filename}`
        }));
      }

      if (req.files.floorPlan) {
        result.floorPlan = req.files.floorPlan.map(file => ({
          filename: file.filename,
          path: `/uploads/floorplans/${file.filename}`,
          url: `${req.protocol}://${req.get('host')}/uploads/floorplans/${file.filename}`
        }));
      }

      if (req.files.document) {
        result.document = req.files.document.map(file => ({
          filename: file.filename,
          path: `/uploads/documents/${file.filename}`,
          url: `${req.protocol}://${req.get('host')}/uploads/documents/${file.filename}`
        }));
      }
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/upload/document
// @desc    Upload single document
// @access  Private
router.post('/document', protect, uploadDocument, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        path: `/uploads/documents/${req.file.filename}`,
        url: `${req.protocol}://${req.get('host')}/uploads/documents/${req.file.filename}`,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/upload/:folder/:filename
// @desc    Delete uploaded file
// @access  Private
router.delete('/:folder/:filename', protect, async (req, res, next) => {
  try {
    const { folder, filename } = req.params;
    const allowedFolders = ['avatars', 'properties', 'floorplans', 'documents', 'misc'];

    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid folder'
      });
    }

    const filePath = path.join(__dirname, '..', 'uploads', folder, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
