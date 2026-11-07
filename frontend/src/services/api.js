export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV
  ? 'http://localhost:5000/api'
  : 'https://apta-backend-e3t7.onrender.com/api');

export const readApiResponse = async (response, fallbackMessage) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data.message ||
      (response.status === 429
        ? 'Se realizaron demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo.'
        : fallbackMessage)
    );
  }
  return data;
};

export const apiHealthCheck = async () => {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error('API unavailable');
  }

  return response.json();
};

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  return readApiResponse(response, 'No se pudo completar la solicitud.');
};
