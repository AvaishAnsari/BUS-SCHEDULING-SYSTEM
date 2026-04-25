const Bus = require('../models/Bus');

exports.getBuses = async (req, res) => {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });
    res.json(buses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createBus = async (req, res) => {
  try {
    const bus = new Bus(req.body);
    const saved = await bus.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: 'Bus number already exists.' });
    res.status(400).json({ message: err.message });
  }
};

exports.updateBus = async (req, res) => {
  try {
    const updated = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Bus not found.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteBus = async (req, res) => {
  try {
    const deleted = await Bus.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Bus not found.' });
    res.json({ message: 'Bus deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
