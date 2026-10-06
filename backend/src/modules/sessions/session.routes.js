const express = require('express');
const { protect } = require('../../middleware/auth');
const {
  listSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  seedDemoSessions,
} = require('./session.controller');

const router = express.Router();

router.use(protect);

router.get('/', listSessions);
router.get('/:id', getSession);
router.post('/', createSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);
router.post('/seed-demo', seedDemoSessions);

module.exports = router;