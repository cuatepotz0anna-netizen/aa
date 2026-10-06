const express = require('express');
const { protect } = require('../../middleware/auth');
const {
  listPrints,
  getPrint,
  createPrint,
  updatePrint,
  deletePrint,
  seedDemoPrints,
} = require('./print.controller');

const router = express.Router();

router.use(protect);

router.get('/', listPrints);
router.get('/:id', getPrint);
router.post('/', createPrint);
router.put('/:id', updatePrint);
router.delete('/:id', deletePrint);
router.post('/seed-demo', seedDemoPrints);

module.exports = router;