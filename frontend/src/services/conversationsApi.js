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
    throw new Error(`Conversations API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchConversations(token) {
  const data = await request('/api/conversations', { token });
  return data?.messages || [];
}

export async function saveConversationMessage(token, message) {
  await request('/api/conversations', {
    token,
    method: 'POST',
    body: { message }
  });
}
