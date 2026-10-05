const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  forgotPassword,
  resetPassword,
  login,
  profile,
  refresh,
  logout,
} = require('./auth.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts. Please try again later.',
  skipSuccessfulRequests: true,
});

router.post('/register', authLimiter, register);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/login', authLimiter, login);
router.post('/refresh', authLimiter, refresh);
router.get('/profile', protect, profile);
router.post('/logout', protect, logout);
router.post('/logout/all', protect, logout);

module.exports = router;
