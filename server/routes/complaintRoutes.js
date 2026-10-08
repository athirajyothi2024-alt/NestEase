const express = require('express');
const Complaint = require('../models/Complaint');
const Apartment = require('../models/Apartment');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Resident: Create a complaint
router.post('/', protect, authorize('resident'), async (req, res) => {
  try {
    const { title, description } = req.body;

    const apartment = await Apartment.findOne({
      resident: req.user.id,
    });

    if (!apartment) {
      return res.status(404).json({
        message: 'No apartment assigned to this resident',
      });
    }

    const complaint = await Complaint.create({
      title,
      description,
      resident: req.user.id,
      apartment: apartment._id,
    });

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to submit complaint',
      error: error.message,
    });
  }
});

// Resident: View own complaints
router.get(
  '/my-complaints',
  protect,
  authorize('resident'),
  async (req, res) => {
    try {
      const complaints = await Complaint.find({
        resident: req.user.id,
      }).populate('apartment', 'apartmentNumber building floor');

      res.json({
        complaints,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to fetch complaints',
        error: error.message,
      });
    }
  }
);

// Admin: View all complaints
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('resident', 'name email phone')
      .populate('apartment', 'apartmentNumber building floor');

    res.json({
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch complaints',
      error: error.message,
    });
  }
});

// Admin: Update complaint status
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found',
      });
    }

    if (!['pending', 'in progress', 'resolved'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
      });
    }

    complaint.status = status;

    await complaint.save();

    res.json({
      message: 'Complaint status updated successfully',
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update complaint status',
      error: error.message,
    });
  }
});

module.exports = router;
