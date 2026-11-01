import { apiFetch } from './client';

export function crearReserva(datos) {
  return apiFetch('/reservas', { method: 'POST', body: datos });
}

export function pagarSena(reservaId) {
  return apiFetch(`/reservas/${reservaId}/pagar-sena`, { method: 'POST' });
}

export function cancelarReserva(reservaId) {
  return apiFetch(`/reservas/${reservaId}/cancelar`, { method: 'POST' });
}

export function misReservas() {
  return apiFetch('/reservas/mias');
}

export function registrarPagoSaldo(reservaId) {
  return apiFetch(`/reservas/${reservaId}/pagar-saldo`, { method: 'POST' });
}
