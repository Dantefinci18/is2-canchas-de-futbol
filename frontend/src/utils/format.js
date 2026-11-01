// Helpers de formato compartidos por varias pantallas.

export const TIPOS_CANCHA = [
  { value: 'FUTBOL_5', label: 'Futbol 5' },
  { value: 'FUTBOL_7', label: 'Futbol 7' },
  { value: 'FUTBOL_11', label: 'Futbol 11' },
];

export function nombreTipoCancha(tipo) {
  return TIPOS_CANCHA.find((t) => t.value === tipo)?.label || tipo;
}

export function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(valor));
}

export function formatearHora(hora) {
  return `${String(hora).padStart(2, '0')}:00`;
}

export function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-AR', { timeZone: 'UTC' });
}

export const ESTADOS_RESERVA_LABEL = {
  PENDIENTE_SENA: 'Pendiente de pago',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  EXPIRADA: 'Expirada',
};
