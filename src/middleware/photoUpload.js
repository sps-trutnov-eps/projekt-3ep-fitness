const multer = require('multer');
const path = require('path');

// Configure multer to use memory storage instead of disk storage
const storage = multer.memoryStorage();

const photoUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size (5MB)
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

module.exports = photoUpload;