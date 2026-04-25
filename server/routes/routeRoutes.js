const express = require('express');
const router = express.Router();
const { getRoutes, createRoute, updateRoute, deleteRoute } = require('../controllers/routeController');

router.get('/', getRoutes);
router.post('/', createRoute);
router.put('/:id', updateRoute);
router.delete('/:id', deleteRoute);

module.exports = router;
