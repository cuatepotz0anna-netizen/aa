const PERSON_NAME_PATTERN = /^[\p{L}]+(?: +[\p{L}]+)*$/u;
const PERSON_NAME_ERROR = 'El nombre solo puede contener letras y espacios.';

const isValidPersonName = (value) =>
  typeof value === 'string' &&
  PERSON_NAME_PATTERN.test(value.trim().normalize('NFC'));

const validatePersonNames = (fields) => {
  for (const value of fields) {
    if (value !== undefined && !isValidPersonName(value)) {
      return PERSON_NAME_ERROR;
    }
  }

  return null;
};

module.exports = {
  PERSON_NAME_PATTERN,
  PERSON_NAME_ERROR,
  isValidPersonName,
  validatePersonNames,
};
