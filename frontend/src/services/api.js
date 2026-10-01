const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};
