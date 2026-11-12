// Fetch game comparison data from backend API
export async function fetchGamesComparison(gameNames) {
  if (!Array.isArray(gameNames) || gameNames.length < 2) return [];

  try {
    const response = await fetch('/api/compare/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ games: gameNames }),
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    console.error('Backend comparison call failed:', e);
  }

  return [];
}
