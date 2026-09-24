const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
} = require('./user.controller');

const router = express.Router();

router.get('/', protect, authorize('ADMIN', 'GERENTE'), getUsers);
router.get('/:id', protect, authorize('ADMIN', 'GERENTE'), getUserById);
router.post('/', protect, authorize('ADMIN', 'GERENTE'), createUser);
router.put('/:id', protect, authorize('ADMIN', 'GERENTE'), updateUser);
router.patch('/:id/deactivate', protect, authorize('ADMIN'), deactivateUser);

module.exports = router;
