const express = require('express');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

const uploadDirectory = path.join(__dirname, '../uploads/profile');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    cb(null, `${req.user.id}-${Date.now()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.put(
  '/profile/image',
  protect,
  upload.single('profileImage'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'Please select an image',
        });
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      user.profileImage = `/uploads/profile/${req.file.filename}`;

      await user.save();

      res.json({
        message: 'Profile picture updated successfully',
        profileImage: user.profileImage,
      });
    } catch (error) {
      console.error('Profile image upload error:', error);

      res.status(500).json({
        message: 'Failed to upload profile picture',
        error: error.message,
      });
    }
  }
);

//both admin and resident route
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.json({
      user,
    });
  } catch (error) {
    console.error('Fetch profile error:', error);

    res.status(500).json({
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
});

// admin only route
router.get('/admin-test', protect, authorize('admin'), (req, res) => {
  res.json({
    message: 'Welcome Admin! You have access to this route.',
    user: req.user,
  });
});

// Admin: Get all residents
router.get('/residents', protect, authorize('admin'), async (req, res) => {
  try {
    const residents = await User.find(
      { role: 'resident' },
      'name email phone apartmentNumber'
    );

    res.json({
      residents,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch residents',
      error: error.message,
    });
  }
});

// Admin can create a new resident
router.post('/residents', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email already exists',
      });
    }

    const resident = await User.create({
      name,
      email,
      password,
      phone,
      role: 'resident',
    });

    res.status(201).json({
      message: 'Resident created successfully',
      resident: {
        _id: resident._id,
        name: resident.name,
        email: resident.email,
        phone: resident.phone,
        role: resident.role,
        apartmentNumber: resident.apartmentNumber,
      },
    });
  } catch (error) {
    console.error('Create resident error:', error);

    res.status(500).json({
      message: 'Failed to create resident',
      error: error.message,
    });
  }
});

module.exports = router;
