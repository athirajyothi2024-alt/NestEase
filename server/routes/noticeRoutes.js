const express = require('express');
const Notice = require('../models/Notice');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin: Create a notice
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, message } = req.body;

    const notice = await Notice.create({
      title,
      message,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: 'Notice created successfully',
      notice,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create notice',
      error: error.message,
    });
  }
});

// Admin: View all notices
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      notices,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch notices',
      error: error.message,
    });
  }
});

// Resident: View all notices
router.get('/resident', protect, authorize('resident'), async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      notices,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch notices',
      error: error.message,
    });
  }
});

// Admin: Delete a notice
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        message: 'Notice not found',
      });
    }

    await notice.deleteOne();

    res.json({
      message: 'Notice deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete notice',
      error: error.message,
    });
  }
});

module.exports = router;
