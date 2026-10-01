const isProduction = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || (isProduction ? null : 'dev_secret_change_me');

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production');
}

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL || '30d',
};