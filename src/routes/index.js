const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');
const { seedRoles } = require('../modules/roles/role.seed');
const { seedPermissions } = require('../modules/permissions/permission.seed');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
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

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

router.get('/seed-defaults', async (req, res) => {
  try {
    await seedRoles();
    await seedPermissions();
    return res.status(200).json({
      success: true,
      message: 'Default roles and permissions seeded successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to seed defaults',
      error: error.message,
    });
  }
});

module.exports = router;
