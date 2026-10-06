const express = require('express');
const { protect } = require('../../middleware/auth');
const {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  seedDemoOrders,
} = require('./order.controller');

const router = express.Router();

router.use(protect);

router.get('/', listOrders);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);
router.post('/seed-demo', seedDemoOrders);

module.exports = router;