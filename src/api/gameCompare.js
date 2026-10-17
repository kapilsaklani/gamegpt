// Fetch basic info for multiple games from backend or RAWG API fallback
export async function fetchGamesComparison(gameNames) {
  try {
    const response = await fetch('/api/compare/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ games: gameNames }),
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    console.error('Backend comparison call failed, using client fallback:', e);
  }

  // Client-side fallback to RAWG API
  const apiKey = "82f9e3d47f5a4fc58029006cc7b43b8d";
  const results = await Promise.all(
    gameNames.map(async (name) => {
      try {
        const resp = await fetch(
          `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(name)}&page_size=1`
        );
        if (!resp.ok) return null;
        const data = await resp.json();
        const game = data.results?.[0];
        if (!game) return null;

        const detailsResp = await fetch(
          `https://api.rawg.io/api/games/${game.id}?key=${apiKey}`
        );
        if (!detailsResp.ok) return null;
        const details = await detailsResp.json();

        return {
          id: game.id,
          name: game.name,
          title: game.name,
          background_image: game.background_image,
          image: game.background_image,
          rating: game.rating,
          released: game.released,
          platforms: game.platforms?.map(p => p.platform.name),
          price: null,
          description: details.description_raw || details.description || "No description available."
        };
      } catch (err) {
        return null;
      }
    })
  );
  return results.filter(Boolean);
}
