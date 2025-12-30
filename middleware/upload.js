const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Determine folder based on file type
    if (file.fieldname === 'avatar') {
      uploadPath += 'avatars/';
    } else if (file.fieldname === 'propertyImages') {
      uploadPath += 'properties/';
    } else if (file.fieldname === 'floorPlan') {
      uploadPath += 'floorplans/';
    } else if (file.fieldname === 'document') {
      uploadPath += 'documents/';
    } else {
      uploadPath += 'misc/';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  // Allowed document types
  const docTypes = /pdf|doc|docx/;
  
  const extname = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetype = file.mimetype;
  
  // Check if it's an image
  if (imageTypes.test(extname) && mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  
  // Check if it's a document
  if (docTypes.test(extname)) {
    return cb(null, true);
  }
  
  cb(new Error('Only images (jpeg, jpg, png, gif, webp) and documents (pdf, doc, docx) are allowed'));
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: fileFilter
});

// Export different upload configurations
module.exports = {
  // Single file uploads
  uploadAvatar: upload.single('avatar'),
  uploadDocument: upload.single('document'),
  uploadFloorPlan: upload.single('floorPlan'),
  
  // Multiple files
  uploadPropertyImages: upload.array('propertyImages', 20), // Max 20 images
  
  // Mixed uploads
  uploadPropertyFiles: upload.fields([
    { name: 'propertyImages', maxCount: 20 },
    { name: 'floorPlan', maxCount: 5 },
    { name: 'document', maxCount: 10 }
  ]),
  
  // Generic upload instance
  upload
};
