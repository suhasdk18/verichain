const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { uploadToCloudinary } = require('../utils/cloudinary'); // Fixed import

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and PDF files are allowed'), false);
    }
  }
});

// Upload file endpoint
router.post('/document', auth, upload.single('document'), async (req, res) => {
  try {
    console.log('📁 File upload request received');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File details:', {
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      bufferSize: req.file.buffer.length
    });

    // Validate file size
    if (req.file.size === 0) {
      return res.status(400).json({ message: 'File is empty' });
    }

    // Upload to Cloudinary
    console.log('🔄 Calling uploadToCloudinary...');
    const fileUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    if (!fileUrl) {
      throw new Error('Cloudinary returned no URL');
    }

    console.log('✅ Upload successful, URL:', fileUrl);

    res.status(200).json({
      message: 'File uploaded successfully',
      document_url: fileUrl,
      file_name: req.file.originalname
    });

  } catch (error) {
    console.error('❌ File upload error:', error);
    res.status(500).json({ 
      message: 'File upload failed', 
      error: error.message 
    });
  }
});

module.exports = router;