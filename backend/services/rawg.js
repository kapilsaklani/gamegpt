import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const RAWG_API_KEY = process.env.RAWG_API_KEY;

export async function fetchGames(ordering = '-rating', pageSize = 5) {
  if (!RAWG_API_KEY) {
    console.warn('RAWG_API_KEY is not configured in environment variables');
    return [];
  }

  try {
    const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&ordering=${ordering}&page_size=${pageSize}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) {
      console.error(`RAWG API returned status ${res.status}`);
      return [];
    }
    const data = await res.json();
    return (data.results || []).map(game => ({
      id: game.id,
      title: game.name,
      name: game.name,
      image: game.background_image || '',
      rating: game.rating || 0.0,
      released: game.released || 'N/A',
      platforms: (game.platforms || []).map(p => p.platform?.name).filter(Boolean),
    }));
  } catch (err) {
    console.error('RAWG fetchGames error:', err.message);
    return [];
  }
}

export async function fetchGameDetails(gameId) {
  if (!RAWG_API_KEY || !gameId) return null;

  try {
    const url = `https://api.rawg.io/api/games/${gameId}?key=${RAWG_API_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('RAWG fetchGameDetails error:', err.message);
    return null;
  }
}

export async function fetchGamesByGenre(genre, pageSize = 4) {
  if (!RAWG_API_KEY) return [];

  try {
    const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(genre)}&ordering=-rating&page_size=${pageSize}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('RAWG fetchGamesByGenre error:', err.message);
    return [];
  }
}

export async function fetchTopRatedGames(pageSize = 3) {
  return fetchGames('-rating', pageSize);
}

export async function compareGames(gameNames) {
  if (!RAWG_API_KEY || !Array.isArray(gameNames) || gameNames.length === 0) return [];

  const results = [];
  for (const name of gameNames.slice(0, 2)) {
    try {
      const searchUrl = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(name)}&page_size=1`;
      const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(5000) });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const firstGame = searchData.results?.[0];

        if (firstGame) {
          const det = await fetchGameDetails(firstGame.id);
          if (det) {
            const platforms = (det.platforms || [])
              .map(p => p.platform?.name)
              .filter(Boolean);

            results.push({
              id: firstGame.id,
              title: det.name || name,
              name: det.name || name,
              image: det.background_image || '',
              background_image: det.background_image || '',
              rating: det.rating || 0.0,
              released: det.released || 'N/A',
              platforms,
              description: det.description_raw || det.description || 'No description available.',
            });
            continue;
          }
        }
      }
    } catch (err) {
      console.error('RAWG compare game error for', name, err.message);
    }
  }

  return results;
}
