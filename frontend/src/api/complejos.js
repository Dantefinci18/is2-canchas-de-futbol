import { apiFetch } from './client';

export function buscarComplejos({ zona, tipo } = {}) {
  const params = new URLSearchParams();
  if (zona) params.set('zona', zona);
  if (tipo) params.set('tipo', tipo);
  const query = params.toString();
  return apiFetch(`/complejos${query ? `?${query}` : ''}`, { auth: false });
}

export function obtenerComplejo(id) {
  return apiFetch(`/complejos/${id}`, { auth: false });
}

export function obtenerMiComplejo() {
  return apiFetch('/complejos/mio');
}

export function crearComplejo(datos) {
  return apiFetch('/complejos', { method: 'POST', body: datos });
}

export function actualizarComplejo(id, datos) {
  return apiFetch(`/complejos/${id}`, { method: 'PUT', body: datos });
}

export function turnosLibresComplejo(complejoId, fecha, tipo) {
  const params = new URLSearchParams({ fecha });
  if (tipo) params.set('tipo', tipo);
  return apiFetch(`/complejos/${complejoId}/turnos-libres?${params.toString()}`, { auth: false });
}

export function agendaDelDia(complejoId, fecha) {
  return apiFetch(`/complejos/${complejoId}/agenda?fecha=${fecha}`);
}
