// Game data API utility communicating through backend endpoints

export async function fetchPopularGames(pageSize = 5, ordering = '-rating') {
  try {
    const res = await fetch(`/api/games?ordering=${encodeURIComponent(ordering)}&page_size=${pageSize}`);
    if (!res.ok) {
      console.error('Games fetch error:', res.statusText);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch popular games:', err);
    return [];
  }
}

export async function fetchGameDetailsById(id) {
  try {
    const res = await fetch(`/api/games/${id}`);
    if (!res.ok) {
      console.error('Game details fetch error:', res.statusText);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch game details:', err);
    return null;
  }
}
