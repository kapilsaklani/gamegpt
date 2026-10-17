import React from "react";
import { addToWishlistBackend } from "../api/wishlist";

export default function GameCard({ game, onShowMore, onAddToWishlist, onNext, onShowDetails }) {
  const handleWishlist = async () => {
    try {
      await addToWishlistBackend(game);
      alert(`"${game.title || game.name}" added to Wishlist!`);
      if (onAddToWishlist) onAddToWishlist(game);
    } catch (e) {
      alert("Error adding to wishlist");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col items-center w-60 m-2 border border-gray-100 dark:border-gray-700">
      <div className="w-40 h-40 mb-2 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
        <img
          src={game.image || game.background_image || "https://via.placeholder.com/160?text=No+Image"}
          alt={game.title || game.name}
          className="w-full h-full object-cover"
          onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/160?text=No+Image'; }}
        />
      </div>
      <h3 className="text-lg font-semibold text-center mb-1 text-gray-900 dark:text-blue-100" style={{textShadow:'0 1px 4px rgba(0,0,0,0.25)'}}>{game.title || game.name}</h3>
      <div className="flex items-center mb-2">
        <span className="text-yellow-400 mr-1 text-lg" style={{textShadow:'0 1px 2px #222'}}>★</span>
        <span className="font-bold text-gray-800 dark:text-white text-base">{game.rating || "N/A"}</span>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow transition-all"
          onClick={handleWishlist}
          type="button"
        >
          Add to Wishlist
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow transition-all"
          onClick={() => onShowDetails && onShowDetails(game)}
          type="button"
        >
          Show Details
        </button>
      </div>
    </div>
  );
}
