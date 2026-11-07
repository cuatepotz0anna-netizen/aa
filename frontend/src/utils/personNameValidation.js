export const PERSON_NAME_ERROR = 'El nombre solo puede contener letras y espacios.';

const PERSON_NAME_PATTERN = /^[\p{L}]+(?: +[\p{L}]+)*$/u;

export const isValidPersonName = (value) =>
  typeof value === 'string' &&
  PERSON_NAME_PATTERN.test(value.trim().normalize('NFC'));
