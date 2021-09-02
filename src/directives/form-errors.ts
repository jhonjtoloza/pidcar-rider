export const defaultErrors = {
  required: () => `Este campo es requerido`,
  minlength: ({requiredLength, actualLength}) => `Debe tener minimo ${requiredLength} letras o numeros`,
  ngbDate: () => 'La fecha es invalida',
  mismatch: () => 'Los campos no coinciden',
  maxlength: ({requiredLength}) => `El maximo de caracteres permitido es de ${requiredLength}`,
  email: () => 'Este campo debe ser un correo valido'
};
