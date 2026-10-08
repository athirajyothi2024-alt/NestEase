const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema(
  {
    apartmentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    building: {
      type: String,
      required: true,
      trim: true,
    },

    floor: {
      type: Number,
      required: true,
    },

    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    status: {
      type: String,
      enum: ['available', 'occupied'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Apartment', apartmentSchema);
