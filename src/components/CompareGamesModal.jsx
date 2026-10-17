import React from "react";

export default function CompareGamesModal({ games, onClose }) {
  if (!games || games.length < 2) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white dark:bg-[#23283a] rounded-lg shadow-lg max-w-3xl w-full p-8 relative max-h-[80vh] overflow-y-auto text-gray-900 dark:text-blue-50">
        <button className="absolute top-2 right-2 text-lg text-gray-600 hover:text-red-500" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-100 text-center">Game Comparison</h2>
        <div className="grid grid-cols-2 gap-8">
          {games.slice(0, 2).map((game, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <img src={game.image || game.background_image} alt={game.title || game.name} className="w-32 h-32 object-cover rounded-xl mb-3 shadow" />
              <h3 className="text-xl font-bold text-blue-700 dark:text-blue-100 mb-2">{game.title || game.name}</h3>
              <div
                className="text-gray-700 dark:text-blue-50 mb-2 text-center text-sm"
                dangerouslySetInnerHTML={{
                  __html: game.description || game.short_description || "No description available."
                }}
              />
              <div className="flex flex-col gap-1 w-full items-center">
                <span className="font-semibold text-gray-900 dark:text-blue-200">Rating: <span className="text-yellow-400">★ {game.rating || "N/A"}</span></span>
                <span className="font-semibold text-gray-900 dark:text-blue-200">Platforms: <span className="font-normal text-gray-700 dark:text-blue-50">{game.platforms ? game.platforms.join(", ") : "N/A"}</span></span>
                <span className="font-semibold text-gray-900 dark:text-blue-200">Release: <span className="font-normal text-gray-700 dark:text-blue-50">{game.released || "N/A"}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
