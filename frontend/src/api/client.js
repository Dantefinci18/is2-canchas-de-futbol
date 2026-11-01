const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

const TOKEN_KEY = 'turnos_futbol_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

class ApiError extends Error {
  constructor(message, status, detalles) {
    super(message);
    this.status = status;
    this.detalles = detalles;
  }
}

// Cliente HTTP minimo: agrega el header de autorizacion automaticamente y
// normaliza los errores que devuelve el backend.
export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(data?.error || 'Ocurrio un error inesperado', response.status, data?.detalles);
  }

  return data;
}
