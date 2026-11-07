const isValidTime = (value) =>
  typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);

module.exports = isValidTime;
