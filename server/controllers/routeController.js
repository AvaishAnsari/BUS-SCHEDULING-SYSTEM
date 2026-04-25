const Route = require('../models/Route');

exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.find().sort({ createdAt: -1 });
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const route = new Route(req.body);
    const saved = await route.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: 'Route number already exists.' });
    res.status(400).json({ message: err.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const updated = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Route not found.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const deleted = await Route.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Route not found.' });
    res.json({ message: 'Route deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
