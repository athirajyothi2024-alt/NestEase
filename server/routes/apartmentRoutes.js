const express = require('express');
const Apartment = require('../models/Apartment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

//create apartment (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const apartment = await Apartment.create(req.body);

    res.status(201).json({
      message: 'Apartment created successfully',
      apartment,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create apartment',
      error: error.message,
    });
  }
});

// get all apartments (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const apartments = await Apartment.find().populate(
      'resident',
      'name email phone apartmentNumber'
    );

    res.json({
      apartments,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch apartments',
      error: error.message,
    });
  }
});

// Assign resident to apartment (admin)
router.put('/:id/assign', protect, authorize('admin'), async (req, res) => {
  try {
    const { residentId } = req.body;

    const apartment = await Apartment.findById(req.params.id);

    if (!apartment) {
      return res.status(404).json({
        message: 'Apartment not found',
      });
    }

    const resident = await User.findById(residentId);

    if (!resident) {
      return res.status(404).json({
        message: 'Resident not found',
      });
    }

    if (resident.role !== 'resident') {
      return res.status(400).json({
        message: 'Only residents can be assigned to an apartment',
      });
    }

    apartment.resident = resident._id;
    apartment.status = 'occupied';

    await apartment.save();

    resident.apartmentNumber = apartment.apartmentNumber;
    await resident.save();

    res.json({
      message: 'Resident assigned successfully',
      apartment,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to assign resident',
      error: error.message,
    });
  }
});

// Resident: view own apartment
router.get(
  '/my-apartment',
  protect,
  authorize('resident'),
  async (req, res) => {
    try {
      const apartment = await Apartment.findOne({
        resident: req.user.id,
      }).populate('resident', 'name email phone');

      if (!apartment) {
        return res.status(404).json({
          message: 'No apartment assigned to this resident',
        });
      }

      res.json({
        apartment,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to fetch apartment',
        error: error.message,
      });
    }
  }
);

module.exports = router;
