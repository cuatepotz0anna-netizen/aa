const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const Role = require('../roles/role.model');
const Session = require('./session.model');
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} = require('../../services/emailService');
const { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_TTL } = require('../../config/jwt');


const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const addMilliseconds = (value) => {
  const match = /^\s*(\d+)([smhd])\s*$/i.exec(value);
  if (!match) return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(Date.now() + amount * multipliers[unit]);
};

const createAccessToken = (user) =>
  jwt.sign(
    {
      sub: user._id,
      type: 'access',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

const createRefreshToken = (user, familyId) => {
  const jti = crypto.randomUUID();

  return jwt.sign(
    {
      sub: user._id,
      familyId,
      jti,
      type: 'refresh',
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  tenantId: user.tenantId || null,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

const revokeUserSessions = async (userId, familyId = null) => {
  const filter = familyId ? { userId, familyId } : { userId };
  await Session.updateMany(filter, {
    $set: {
      isActive: false,
      revokedAt: new Date(),
    },
  });
};

const revokeSessionFamily = async (userId, familyId) => {
  if (!userId || !familyId) return;
  await revokeUserSessions(userId, familyId);
};

const issueSessionPair = async (user) => {
  const familyId = crypto.randomUUID();
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user, familyId);

  await Session.create({
    userId: user._id,
    familyId,
    tokenHash: hashToken(refreshToken),
    expiresAt: addMilliseconds(REFRESH_TOKEN_TTL),
    revokedAt: null,
    isActive: true,
  });

  return {
    accessToken,
    refreshToken,
    token: accessToken,
    familyId,
  };
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
      });
    }

    const defaultRole = 'EMPLEADO';
    const roleDoc = await Role.findOne({ name: defaultRole });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: defaultRole,
      roleId: roleDoc ? roleDoc._id : null,
      isActive: true,
    });

    const { accessToken, refreshToken } = await issueSessionPair(user);
    try {
  await sendWelcomeEmail({
    to: user.email,
    name: user.name,
  });
} catch (emailError) {
  console.error('Welcome email failed:', emailError.message);
}

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token: accessToken,
        accessToken,
        refreshToken,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
      isActive: true,
    });

    // Respuesta genérica por seguridad, exista o no el correo
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          'If an account exists with that email, password reset instructions have been sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashToken(resetToken);

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const frontendUrl =
  process.env.CLIENT_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://aa-6xy.pages.dev'
    : 'http://localhost:5173');

    const resetUrl =
  `${frontendUrl}/#/reset-password?token=${resetToken}&email=${encodeURIComponent(
    user.email
  )}`;

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
      });
    } catch (emailError) {
      console.error('Password reset email failed:', emailError.message);
    }

    return res.status(200).json({
      success: true,
      message:
        'If an account exists with that email, password reset instructions have been sent.',
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, email, password } = req.body || {};

    if (!token || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token, email and new password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const tokenHash = hashToken(token);

    const user = await User.findOne({
      email: normalizedEmail,
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
      isActive: true,
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired',
      });
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    await revokeUserSessions(user._id);

    try {
  await sendPasswordChangedEmail({
    to: user.email,
    name: user.name,
  });
} catch (emailError) {
  console.error('Password changed email failed:', emailError.message);
}

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = await issueSessionPair(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token: accessToken,
        accessToken,
        refreshToken,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

const profile = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(req.user),
    },
  });
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type',
      });
    }

    const tokenHash = hashToken(refreshToken);
    const currentSession = await Session.findOne({
      userId: decoded.sub,
      familyId: decoded.familyId,
      tokenHash,
      isActive: true,
    }).sort({ createdAt: -1 });

    if (!currentSession || currentSession.expiresAt < new Date()) {
      await revokeSessionFamily(decoded.sub, decoded.familyId);
      return res.status(401).json({
        success: false,
        message: 'Refresh token is invalid or has been revoked',
      });
    }

    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User no longer active',
      });
    }

    currentSession.isActive = false;
    currentSession.revokedAt = new Date();
    await currentSession.save();

    const nextFamilyId = currentSession.familyId;
    const nextRefreshToken = createRefreshToken(user, nextFamilyId);

    await Session.create({
      userId: user._id,
      familyId: nextFamilyId,
      tokenHash: hashToken(nextRefreshToken),
      expiresAt: addMilliseconds(REFRESH_TOKEN_TTL),
      revokedAt: null,
      isActive: true,
    });

    const accessToken = createAccessToken(user);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: accessToken,
        accessToken,
        refreshToken: nextRefreshToken,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken, allSessions } = req.body || {};
    const userId = req.user ? req.user._id : null;

    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await Session.updateMany(
        { userId: userId || { $exists: true }, tokenHash },
        { $set: { isActive: false, revokedAt: new Date() } }
      );
    } else if (allSessions && userId) {
      await revokeUserSessions(userId);
    } else if (userId) {
      await revokeUserSessions(userId);
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  forgotPassword,
  resetPassword,
  login,
  profile,
  refresh,
  logout,
};
