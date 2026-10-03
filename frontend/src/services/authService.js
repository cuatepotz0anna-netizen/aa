const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_CONNECTION_ERROR = 'No se pudo conectar con la API. Verifica que el backend esté iniciado y que su configuración de MongoDB sea válida.';

const requestJson = async (path, options, fallbackMessage) => {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error(API_CONNECTION_ERROR);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

export const loginRequest = (email, password) =>
  requestJson('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }, 'No se pudo iniciar sesión');

export const registerRequest = (payload) =>
  requestJson('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 'No se pudo registrar el usuario');

export const fetchProfile = (token) =>
  requestJson('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  }, 'No se pudo cargar el perfil');

export const refreshRequest = (refreshToken) =>
  requestJson('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }, 'No se pudo renovar la sesión');

export const logoutRequest = (token, refreshToken) =>
  requestJson('/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  }, 'No se pudo cerrar la sesión en el servidor');
