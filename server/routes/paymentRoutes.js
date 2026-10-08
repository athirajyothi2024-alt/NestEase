const express = require('express');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin: Create a payment
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { residentId, apartmentNumber, amount, description, dueDate } =
      req.body;

    if (
      !residentId ||
      !apartmentNumber ||
      !amount ||
      !description ||
      !dueDate
    ) {
      return res.status(400).json({
        message: 'All payment fields are required',
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
        message: 'Payment can only be created for a resident',
      });
    }

    const payment = await Payment.create({
      resident: residentId,
      apartmentNumber,
      amount,
      description,
      dueDate,
    });

    res.status(201).json({
      message: 'Payment created successfully',
      payment,
    });
  } catch (error) {
    console.error('Create payment error:', error);

    res.status(500).json({
      message: 'Failed to create payment',
      error: error.message,
    });
  }
});

// Admin: View all payments
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('resident', 'name email phone apartmentNumber')
      .sort({ createdAt: -1 });

    res.json({
      payments,
    });
  } catch (error) {
    console.error('Fetch payments error:', error);

    res.status(500).json({
      message: 'Failed to fetch payments',
      error: error.message,
    });
  }
});

// Resident: View own payments
router.get('/my-payments', protect, authorize('resident'), async (req, res) => {
  try {
    const payments = await Payment.find({
      resident: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      payments,
    });
  } catch (error) {
    console.error('Fetch resident payments error:', error);

    res.status(500).json({
      message: 'Failed to fetch your payments',
      error: error.message,
    });
  }
});

// Admin: Mark payment as paid
router.put('/:id/pay', protect, authorize('admin'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found',
      });
    }

    payment.status = 'paid';
    payment.paidAt = new Date();

    await payment.save();

    res.json({
      message: 'Payment marked as paid',
      payment,
    });
  } catch (error) {
    console.error('Mark payment error:', error);

    res.status(500).json({
      message: 'Failed to update payment',
      error: error.message,
    });
  }
});

// Admin: Delete payment
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found',
      });
    }

    await payment.deleteOne();

    res.json({
      message: 'Payment deleted successfully',
    });
  } catch (error) {
    console.error('Delete payment error:', error);

    res.status(500).json({
      message: 'Failed to delete payment',
      error: error.message,
    });
  }
});

module.exports = router;
