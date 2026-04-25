const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    departureTime: { type: String, required: true }, // "HH:MM" format
    arrivalTime: { type: String, required: true },   // "HH:MM" format
    date: { type: String, required: true },          // "YYYY-MM-DD"
    isPeakHour: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Scheduled', 'In Transit', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
  },
  { timestamps: true }
);

// Compound index to detect conflicts: same bus, same date, same departure
scheduleSchema.index({ busId: 1, date: 1, departureTime: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
