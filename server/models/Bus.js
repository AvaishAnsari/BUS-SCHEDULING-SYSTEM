const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    busNumber: { type: String, required: true, unique: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    type: {
      type: String,
      enum: ['Standard', 'Express', 'Mini', 'Double Decker'],
      default: 'Standard',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bus', busSchema);
