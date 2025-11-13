const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, { token, method = 'GET', body } = {}) {
  if (!token) {
    throw new Error('Token requerido para escenarios');
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
    throw new Error(error.message || 'Error en escenarios');
  }

  return response.json();
}

export async function fetchScenarios(token) {
  const data = await request('/api/scenarios', { token });
  return data.scenarios || [];
}

export async function createScenario(token, payload) {
  const data = await request('/api/scenarios', {
    token,
    method: 'POST',
    body: payload
  });
  return data.scenario;
}

export async function activateScenario(token, scenarioId) {
  const data = await request(`/api/scenarios/${scenarioId}/activate`, {
    token,
    method: 'PATCH'
  });
  return data.scenario;
}
