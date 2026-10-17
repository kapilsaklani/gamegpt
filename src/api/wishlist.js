const API_BASE = '/api';

export async function fetchWishlist() {
  try {
    const res = await fetch(`${API_BASE}/wishlist/`);
    if (!res.ok) throw new Error('Failed to fetch wishlist');
    return await res.json();
  } catch (e) {
    console.error('Wishlist fetch error:', e);
    // fallback to localStorage if needed
    const stored = localStorage.getItem('wishlist_games');
    return stored ? JSON.parse(stored) : [];
  }
}

export async function addToWishlistBackend(game) {
  try {
    const res = await fetch(`${API_BASE}/wishlist/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game_id: game.id,
        title: game.title || game.name,
        image: game.image || game.background_image,
        rating: game.rating || 0.0,
      }),
    });
    if (!res.ok) throw new Error('Failed to add to wishlist');
    return await res.json();
  } catch (e) {
    console.error('Wishlist add error:', e);
    // Fallback to local storage
    const stored = JSON.parse(localStorage.getItem('wishlist_games') || '[]');
    if (!stored.find(g => g.id === game.id)) {
      stored.push(game);
      localStorage.setItem('wishlist_games', JSON.stringify(stored));
    }
    return game;
  }
}

export async function removeFromWishlistBackend(id) {
  try {
    const res = await fetch(`${API_BASE}/wishlist/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to remove from wishlist');
    return true;
  } catch (e) {
    console.error('Wishlist remove error:', e);
    // Fallback to local storage
    const stored = JSON.parse(localStorage.getItem('wishlist_games') || '[]');
    const updated = stored.filter(g => g.id !== id);
    localStorage.setItem('wishlist_games', JSON.stringify(updated));
    return true;
  }
}
