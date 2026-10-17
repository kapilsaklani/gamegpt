const API_BASE = '/api';

export async function submitFeedbackBackend(rating, comment) {
  try {
    const res = await fetch(`${API_BASE}/feedback/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment }),
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
    return await res.json();
  } catch (e) {
    console.error('Feedback submit error:', e);
    // fallback to localStorage
    const stored = JSON.parse(localStorage.getItem('gamebot_feedback_ratings') || '[]');
    stored.push({ rating, comment, date: new Date().toISOString() });
    localStorage.setItem('gamebot_feedback_ratings', JSON.stringify(stored));
    return { rating, comment };
  }
}

export async function fetchFeedbackBackend() {
  try {
    const res = await fetch(`${API_BASE}/feedback/`);
    if (!res.ok) throw new Error('Failed to fetch feedback');
    return await res.json();
  } catch (e) {
    console.error('Feedback fetch error:', e);
    return [];
  }
}
