export const PHONE_ERROR = 'El teléfono solo puede contener números.';

export const isValidPhone = (value) =>
  typeof value === 'string' && (value.trim() === '' || /^\d+$/.test(value.trim()));
