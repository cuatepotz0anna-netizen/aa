const validateNumericFields = (fields) => {
  for (const { value, label, minimum = 0, integer = false } of fields) {
    if (value === undefined) continue;

    if (value === null) {
      return `${label} debe ser un número válido.`;
    }

    const number = Number(value);
    if (!Number.isFinite(number)) {
      return `${label} debe ser un número válido.`;
    }

    if (number < minimum) {
      return `${label} debe ser mayor o igual a ${minimum}.`;
    }

    if (integer && !Number.isInteger(number)) {
      return `${label} debe ser un número entero.`;
    }
  }

  return null;
};

module.exports = validateNumericFields;
