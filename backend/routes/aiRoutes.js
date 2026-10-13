const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { analyzeResume } = require('../controllers/aiController');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(
        new Error('Only PDF and DOCX resume files are allowed.')
      );
    }

    callback(null, true);
  },
});

const handleResumeUpload = (req, res, next) => {
  upload.single('resume')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError &&
        error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        message: 'Resume file must not exceed 5 MB.',
      });
    }

    return res.status(400).json({
      message: error.message || 'Invalid resume upload.',
    });
  });
};

router.post('/analyze-resume', handleResumeUpload, analyzeResume);

module.exports = router;