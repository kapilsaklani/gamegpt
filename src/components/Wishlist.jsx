import React, { useState, useEffect } from "react";
import { fetchWishlist, removeFromWishlistBackend } from "../api/wishlist";
import { useNavigate } from "react-router-dom";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadWishlist = async () => {
    setLoading(true);
    const data = await fetchWishlist();
    setWishlist(data);
    setLoading(false);
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (id) => {
    await removeFromWishlistBackend(id);
    await loadWishlist();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen text-gray-900 dark:text-blue-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-400">My Wishlist (PostgreSQL Saved)</h2>
        <button
          onClick={() => navigate('/chat')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all"
        >
          ← Back to Chat
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 dark:text-gray-400 text-lg">Loading wishlist from database...</div>
      ) : wishlist.length === 0 ? (
        <div className="bg-white dark:bg-[#23263a] p-8 rounded-2xl shadow text-center text-gray-500 dark:text-gray-300">
          No games wishlisted yet. Explore recommendations and click "Add to Wishlist"!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map(game => (
            <div key={game.id} className="bg-white dark:bg-[#23263a] border border-gray-200 dark:border-blue-900/40 rounded-2xl shadow-lg p-4 flex flex-col items-center">
              <img
                src={game.image || game.background_image || "https://via.placeholder.com/160?text=No+Image"}
                alt={game.title}
                className="w-32 h-32 object-cover rounded-xl mb-3 shadow"
                onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/160?text=No+Image'; }}
              />
              <h3 className="text-lg font-bold text-center mb-1 text-gray-900 dark:text-blue-100">
                {game.title}
              </h3>
              <div className="flex items-center mb-3">
                <span className="text-yellow-400 mr-1 text-lg">★</span>
                <span className="font-bold text-gray-800 dark:text-white text-base">{game.rating || "N/A"}</span>
              </div>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow"
                onClick={() => handleRemove(game.id)}
              >
                Remove Item
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
