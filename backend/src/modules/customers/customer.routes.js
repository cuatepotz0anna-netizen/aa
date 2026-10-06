const express = require('express');
const { protect } = require('../../middleware/auth');
const {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  seedDemoCustomers,
} = require('./customer.controller');

const router = express.Router();

router.use(protect);

router.get('/', listCustomers);
router.get('/:id', getCustomer);
router.post('/', createCustomer);
router.post('/seed-demo', seedDemoCustomers);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;