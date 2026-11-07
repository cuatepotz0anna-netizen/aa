const PHONE_ERROR = 'El teléfono solo puede contener números.';

const isValidPhone = (value) => {
  if (value === undefined || value === null || value === '') return true;
  if (typeof value !== 'string' && typeof value !== 'number') return false;
  const phone = String(value).trim();
  return phone === '' || /^\d+$/.test(phone);
};

module.exports = {
  PHONE_ERROR,
  isValidPhone,
};
