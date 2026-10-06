const express = require('express');
const mongoose = require('mongoose');
const { seedRoles } = require('../modules/roles/role.seed');
const { seedPermissions } = require('../modules/permissions/permission.seed');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use('/auth', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'La base de datos no está disponible; la autenticación requiere conexión.',
    });
  }

  return next();
}, require('../modules/auth/auth.routes'));

router.use('/users', require('../modules/users/user.routes'));
router.use('/customers', require('../modules/customers/customer.routes'));
router.use('/products', require('../modules/products/product.routes'));
router.use('/sessions', require('../modules/sessions/session.routes'));

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      databaseConnected: mongoose.connection.readyState === 1,
    },
  });
});

router.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ERP backend is reachable',
    data: { ok: true },
  });
});

router.get('/seed-defaults', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    await seedRoles();
    await seedPermissions();
    return res.status(200).json({
      success: true,
      message: 'Default roles and permissions seeded successfully',
    });
  } catch (error) {
    return next(error);
  }
});


module.exports = router;
