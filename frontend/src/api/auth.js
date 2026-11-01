import { apiFetch } from './client';

export function registrarJugador(datos) {
  return apiFetch('/auth/registro/jugador', { method: 'POST', body: datos, auth: false });
}

export function registrarAdministrador(datos) {
  return apiFetch('/auth/registro/administrador', { method: 'POST', body: datos, auth: false });
}

export function login(datos) {
  return apiFetch('/auth/login', { method: 'POST', body: datos, auth: false });
}

export function perfil() {
  return apiFetch('/auth/perfil');
}
