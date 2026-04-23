const multer = require('multer');
const path = require('path');

// Konfigurace multeru pro použití paměťového úložiště namísto diskového úložiště
const storage = multer.memoryStorage();

const photoUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit velikosti souboru (5MB)
  },
  fileFilter: (req, file, cb) => {
    // Přijímat pouze soubory obrázků
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

module.exports = photoUpload;