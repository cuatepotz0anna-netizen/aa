const jwt = require('jsonwebtoken');
const User = require('../modules/users/user.model');
const { JWT_SECRET } = require('../config/jwt');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenMatch = /^Bearer\s+(\S+)$/i.exec(authHeader || '');
    if (!tokenMatch) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = jwt.verify(tokenMatch[1], JWT_SECRET, { algorithms: ['HS256'] });

    if (decoded.type !== 'access' || typeof decoded.sub !== 'string') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type',
      });
    }

    const user = await User.findById(decoded.sub).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
    }

    req.user = user;
    req.tenantId = user.tenantId || null;
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
