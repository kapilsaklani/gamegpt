import React from "react";

export default function GameDetailsModal({ game, details, onClose }) {
  if (!game) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full p-6 relative max-h-[80vh] overflow-y-auto">
        <button className="absolute top-2 right-2 text-lg text-gray-600 hover:text-red-500" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-2 text-blue-700 dark:text-blue-300">{game.title || details?.name}</h2>
        <img src={game.image || details?.background_image} alt={game.title} className="w-full max-h-64 object-cover rounded mb-4" />
        <p className="mb-3 text-gray-800 dark:text-gray-100">{details?.description_raw || details?.description || 'No description available.'}</p>
        {details?.platforms && (
          <div className="mb-2">
            <span className="font-semibold">Platforms: </span>
            {details.platforms.map(p => p.platform.name).join(', ')}
          </div>
        )}
        {details?.metacritic && (
          <div className="mb-2">
            <span className="font-semibold">Metacritic: </span>{details.metacritic}
          </div>
        )}
        {details?.website && (
          <div className="mb-2">
            <a href={details.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Official Website</a>
          </div>
        )}
        {details?.stores && details.stores.length > 0 && (
          <div className="mb-2">
            <span className="font-semibold">Stores: </span>
            {details.stores.map(s => (
              <a key={s.store.id} href={`https://${s.store.domain}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mr-2">{s.store.name}</a>
            ))}
          </div>
        )}
        {details?.clip && details.clip.video && (
          <div className="mb-2">
            <video src={details.clip.video} controls className="w-full rounded" />
          </div>
        )}
        {details?.short_screenshots && details.short_screenshots.length > 0 && (
          <div className="mb-2">
            <span className="font-semibold">Screenshots:</span>
            <div className="flex gap-2 mt-1 overflow-x-auto">
              {details.short_screenshots.map(ss => (
                <img key={ss.id || ss.image} src={ss.image} alt="Screenshot" className="h-24 rounded" />
              ))}
            </div>
          </div>
        )}
        {details?.ratings && details.ratings.length > 0 && (
          <div className="mb-2">
            <span className="font-semibold">User Ratings: </span>
            {details.ratings.map(r => `${r.title}: ${r.percent}%`).join(', ')}
          </div>
        )}
        <button
          className="mt-6 w-full py-3 bg-blue-700 hover:bg-blue-900 text-white text-lg font-bold rounded shadow transition-all"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
}
