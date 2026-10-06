const express = require('express');
const { protect } = require('../../middleware/auth');
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  seedDemoProducts,
} = require('./product.controller');

const router = express.Router();

router.use(protect);

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/seed-demo', seedDemoProducts);

module.exports = router;