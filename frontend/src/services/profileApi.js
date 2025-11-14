const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, { token, method = 'GET', body } = {}) {
  if (!token) {
    throw new Error('Token requerido');
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error en perfil');
  }

  return response.json();
}

export async function fetchProfile(token) {
  const data = await request('/api/profile/me', { token });
  return data.profile;
}

export async function updateProfile(token, payload) {
  const data = await request('/api/profile/me', {
    token,
    method: 'PUT',
    body: payload
  });
  return data.profile;
}
