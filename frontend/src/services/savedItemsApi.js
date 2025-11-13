const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, { token, method = 'GET', body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Saved items API error');
  }

  return res.json();
}

export async function fetchSavedItems(token, type) {
  const query = type ? `?type=${encodeURIComponent(type)}` : '';
  const data = await request(`/api/saved-items${query}`, { token });
  return data.items || [];
}

export async function createSavedItem(token, payload) {
  console.info('📡 API: Enviando solicitud de guardado:', payload);
  try {
    const result = await request('/api/saved-items', {
      token,
      method: 'POST',
      body: payload
    });
    console.info('📡 API: Respuesta exitosa:', result);
    return result;
  } catch (error) {
    console.error('📡 API: Error en solicitud:', error);
    throw error;
  }
}

export async function deleteSavedItem(token, id) {
  return request(`/api/saved-items/${id}`, {
    token,
    method: 'DELETE'
  });
}
