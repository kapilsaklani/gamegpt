// RAWG API utility
// Usage: import { fetchPopularGames } from './api/rawg';

export async function fetchPopularGames(apiKey, pageSize = 5, ordering = '-rating') {
  const url = `https://api.rawg.io/api/games?key=${apiKey}&ordering=${ordering}&page_size=${pageSize}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('RAWG API error:', errorText);
    throw new Error('Failed to fetch games from RAWG: ' + errorText);
  }
  const data = await res.json();
  // Map to the format expected by GameCard
  return data.results.map(game => ({
    id: game.id,
    title: game.name,
    image: game.background_image || 'https://via.placeholder.com/160?text=No+Image',
    rating: game.rating,
  }));
}
