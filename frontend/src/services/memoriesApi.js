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
    throw new Error(error.message || 'Error con recuerdos');
  }

  return response.json();
}

export async function fetchMemories(token, userId, limit = 20) {
  const data = await request(`/api/companion/${userId}/memories?limit=${limit}`, { token });
  return data.memories || [];
}

export async function createMemory(token, userId, payload) {
  const data = await request(`/api/companion/${userId}/memories`, {
    token,
    method: 'POST',
    body: payload
  });
  return data.memory;
}
