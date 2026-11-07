const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const PASSWORD_ERROR = 'La contraseña debe tener entre 8 y 128 caracteres.';

const isValidPassword = (value) =>
  typeof value === 'string' &&
  value.length >= PASSWORD_MIN_LENGTH &&
  value.length <= PASSWORD_MAX_LENGTH;

module.exports = {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_ERROR,
  isValidPassword,
};
