const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    routeNumber: { type: String, required: true, unique: true, trim: true },
    startLocation: { type: String, required: true, trim: true },
    endLocation: { type: String, required: true, trim: true },
    distance: { type: Number, required: true, min: 0 }, // km
    estimatedDuration: { type: Number, required: true, min: 1 }, // minutes
    stops: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Route', routeSchema);
