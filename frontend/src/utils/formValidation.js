export function setSpanishValidityMessage(event, label) {
  const { validity, type } = event.currentTarget;
  const message = validity.valueMissing
    ? `${label} es obligatorio.`
    : validity.rangeUnderflow
      ? `${label} debe ser mayor o igual a ${event.currentTarget.min}.`
      : validity.tooShort
        ? `${label} debe tener al menos ${event.currentTarget.minLength} caracteres.`
        : validity.tooLong
          ? `${label} no puede superar ${event.currentTarget.maxLength} caracteres.`
          : validity.stepMismatch
            ? `${label} debe ser un número entero.`
            : validity.typeMismatch && type === 'email'
              ? 'Ingresa un correo electrónico válido.'
              : type === 'tel'
                ? 'El teléfono solo puede contener números.'
              : type === 'time'
                ? 'Ingresa una hora válida.'
                : `Ingresa un valor válido para ${label.toLowerCase()}.`;
  event.currentTarget.setCustomValidity(message);
}
