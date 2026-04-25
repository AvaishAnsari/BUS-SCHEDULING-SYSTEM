const Schedule = require('../models/Schedule');
const Bus = require('../models/Bus');
const Route = require('../models/Route');

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert "HH:MM" → total minutes from midnight */
function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** Add minutes to "HH:MM" → "HH:MM" */
function addMinutes(t, mins) {
  let total = timeToMinutes(t) + mins;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Determine if a time string falls in peak hours */
function isPeakHour(t) {
  const mins = timeToMinutes(t);
  return (mins >= 7 * 60 && mins < 9 * 60) || (mins >= 17 * 60 && mins < 19 * 60);
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

exports.getSchedules = async (req, res) => {
  try {
    const filter = {};
    if (req.query.routeId) filter.routeId = req.query.routeId;
    if (req.query.busId) filter.busId = req.query.busId;
    if (req.query.date) filter.date = req.query.date;

    const schedules = await Schedule.find(filter)
      .populate('busId', 'busNumber type capacity')
      .populate('routeId', 'routeNumber startLocation endLocation distance')
      .sort({ date: 1, departureTime: 1 });

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { busId, routeId, departureTime, date } = req.body;

    // Conflict check: same bus within 15-min window on same date
    const depMins = timeToMinutes(departureTime);
    const existing = await Schedule.find({ busId, date });
    const conflict = existing.find((s) => {
      const diff = Math.abs(timeToMinutes(s.departureTime) - depMins);
      return diff < 15;
    });
    if (conflict) {
      return res.status(409).json({
        message: `Conflict: Bus already scheduled at ${conflict.departureTime} on ${date}.`,
      });
    }

    // Compute arrival from route duration
    const route = await Route.findById(routeId);
    if (!route) return res.status(404).json({ message: 'Route not found.' });

    const arrivalTime = addMinutes(departureTime, route.estimatedDuration);
    const peak = isPeakHour(departureTime);

    const schedule = new Schedule({ ...req.body, arrivalTime, isPeakHour: peak });
    const saved = await schedule.save();
    const populated = await saved.populate([
      { path: 'busId', select: 'busNumber type capacity' },
      { path: 'routeId', select: 'routeNumber startLocation endLocation distance' },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: 'Duplicate schedule entry.' });
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const deleted = await Schedule.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Schedule not found.' });
    res.json({ message: 'Schedule deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Smart Auto-Scheduler ────────────────────────────────────────────────────

exports.generateSchedule = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ message: 'Date is required (YYYY-MM-DD).' });

    const [buses, routes] = await Promise.all([
      Bus.find({ isActive: true }),
      Route.find(),
    ]);

    if (!buses.length) return res.status(400).json({ message: 'No active buses found.' });
    if (!routes.length) return res.status(400).json({ message: 'No routes found.' });

    // Clear existing schedules for this date
    await Schedule.deleteMany({ date });

    const TIME_BLOCKS = [
      { start: '06:00', end: '07:00', gap: 30 }, // Early
      { start: '07:00', end: '09:00', gap: 15 }, // Peak AM
      { start: '09:00', end: '17:00', gap: 30 }, // Mid-day
      { start: '17:00', end: '19:00', gap: 15 }, // Peak PM
      { start: '19:00', end: '22:00', gap: 30 }, // Evening
    ];

    const created = [];
    // Track last departure time per bus (in minutes) to avoid overlaps
    const busLastTime = {}; // busId → minutes
    buses.forEach((b) => (busLastTime[b._id.toString()] = -999));

    let busIndex = 0;

    for (const route of routes) {
      for (const block of TIME_BLOCKS) {
        let current = block.start;
        while (timeToMinutes(current) < timeToMinutes(block.end)) {
          const depMins = timeToMinutes(current);
          // Round-robin bus assignment
          let assigned = null;
          for (let attempt = 0; attempt < buses.length; attempt++) {
            const candidate = buses[(busIndex + attempt) % buses.length];
            const cid = candidate._id.toString();
            if (depMins - busLastTime[cid] >= 15) {
              assigned = candidate;
              busIndex = (busIndex + attempt + 1) % buses.length;
              busLastTime[cid] = depMins;
              break;
            }
          }

          if (assigned) {
            const arrivalTime = addMinutes(current, route.estimatedDuration);
            const peak = isPeakHour(current);
            try {
              const s = await Schedule.create({
                busId: assigned._id,
                routeId: route._id,
                departureTime: current,
                arrivalTime,
                date,
                isPeakHour: peak,
                status: 'Scheduled',
              });
              created.push(s);
            } catch (_) {
              // skip duplicates silently
            }
          }

          current = addMinutes(current, block.gap);
        }
      }
    }

    const populated = await Schedule.find({ date })
      .populate('busId', 'busNumber type capacity')
      .populate('routeId', 'routeNumber startLocation endLocation distance')
      .sort({ departureTime: 1 });

    res.status(201).json({
      message: `Generated ${populated.length} schedules for ${date}.`,
      schedules: populated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
