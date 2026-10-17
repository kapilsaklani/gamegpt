const API_BASE = '/api';

export async function fetchChatSessions() {
  try {
    const res = await fetch(`${API_BASE}/chats/`);
    if (!res.ok) throw new Error('Failed to fetch chat sessions');
    return await res.json();
  } catch (e) {
    console.error('API Error fetchChatSessions:', e);
    return [];
  }
}

export async function createChatSession() {
  try {
    const res = await fetch(`${API_BASE}/chats/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to create chat session');
    return await res.json();
  } catch (e) {
    console.error('API Error createChatSession:', e);
    return null;
  }
}

export async function fetchChatSessionDetails(sessionId) {
  try {
    const res = await fetch(`${API_BASE}/chats/${sessionId}/`);
    if (!res.ok) throw new Error('Failed to fetch session details');
    return await res.json();
  } catch (e) {
    console.error('API Error fetchChatSessionDetails:', e);
    return null;
  }
}

export async function sendChatMessageToBackend(sessionId, text) {
  try {
    const res = await fetch(`${API_BASE}/chats/${sessionId}/message/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Failed to send chat message');
    return await res.json();
  } catch (e) {
    console.error('API Error sendChatMessageToBackend:', e);
    throw e;
  }
}
