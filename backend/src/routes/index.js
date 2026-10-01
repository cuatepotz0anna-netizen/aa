const express = require('express');
const mongoose = require('mongoose');
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

module.exports = router;
