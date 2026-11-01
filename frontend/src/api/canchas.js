import { apiFetch } from './client';

export function listarCanchas(complejoId) {
  return apiFetch(`/complejos/${complejoId}/canchas`, { auth: false });
}

export function crearCancha(complejoId, datos) {
  return apiFetch(`/complejos/${complejoId}/canchas`, { method: 'POST', body: datos });
}

export function actualizarCancha(canchaId, datos) {
  return apiFetch(`/canchas/${canchaId}`, { method: 'PUT', body: datos });
}

export function desactivarCancha(canchaId) {
  return apiFetch(`/canchas/${canchaId}`, { method: 'DELETE' });
}
