const express = require('express');
const { protect } = require('../../middleware/auth');
const {
  listAttendance,
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  seedDemoAttendance,
} = require('./attendance.controller');

const router = express.Router();

router.use(protect);

router.get('/', listAttendance);
router.get('/:id', getAttendance);
router.post('/', createAttendance);
router.put('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);
router.post('/seed-demo', seedDemoAttendance);

module.exports = router;