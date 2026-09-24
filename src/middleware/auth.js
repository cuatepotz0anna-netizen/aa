const jwt = require('jsonwebtoken');
const User = require('../modules/users/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.type && decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type',
      });
    }

    const user = await User.findById(decoded.sub || decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
    }

    if (decoded.tenantId && user.tenantId && decoded.tenantId.toString() !== user.tenantId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Tenant mismatch',
      });
    }

    req.user = user;
    req.tenantId = user.tenantId || decoded.tenantId || null;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource',
    });
  }

  return next();
};

module.exports = {
  protect,
  authorize,
};
