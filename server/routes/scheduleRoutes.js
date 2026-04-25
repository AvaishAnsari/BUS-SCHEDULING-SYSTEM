const express = require('express');
const router = express.Router();
const {
  getSchedules,
  createSchedule,
  deleteSchedule,
  generateSchedule,
} = require('../controllers/scheduleController');

router.get('/', getSchedules);
router.post('/', createSchedule);
router.delete('/:id', deleteSchedule);
router.post('/generate', generateSchedule);

module.exports = router;
