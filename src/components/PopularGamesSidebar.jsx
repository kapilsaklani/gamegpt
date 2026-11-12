import React, { useEffect, useState } from "react";
import GameCarousel from "./GameCarousel";
import GameDetailsModal from "./GameDetailsModal";
import { fetchPopularGames, fetchGameDetailsById } from "../api/rawg";

const TAB_CONFIG = [
  { key: 'trending', label: 'Trending', ordering: '-added' },
  { key: 'new', label: 'New Releases', ordering: '-released' },
  { key: 'editors', label: "Editor's Picks", ordering: '-rating' },
];

export default function PopularGamesSidebar() {
  const [activeTab, setActiveTab] = useState('trending');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsGame, setDetailsGame] = useState(null);
  const [gameDetails, setGameDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  async function fetchGameDetails(game) {
    setDetailsLoading(true);
    setGameDetails(null);
    setDetailsGame(game);
    try {
      if (game.id) {
        const data = await fetchGameDetailsById(game.id);
        setGameDetails(data);
      } else {
        setGameDetails(null);
      }
    } catch (e) {
      setGameDetails(null);
    }
    setDetailsLoading(false);
  }

  function handleShowDetails(game) {
    fetchGameDetails(game);
  }

  function handleCloseDetails() {
    setDetailsGame(null);
    setGameDetails(null);
    setDetailsLoading(false);
  }

  useEffect(() => {
    async function fetchTabGames() {
      setLoading(true);
      const tab = TAB_CONFIG.find(t => t.key === activeTab);
      try {
        const res = await fetchPopularGames(5, tab.ordering);
        setGames(res || []);
      } catch (e) {
        console.error('Error fetching tab games:', e);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTabGames();
  }, [activeTab]);

  return (
    <div>
      <h2 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-2 px-4">Trending & New Releases</h2>
      <div className="flex gap-2 px-4 mb-3">
        {TAB_CONFIG.map(tab => (
          <button
            key={tab.key}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-[#23263a] text-blue-200 hover:bg-blue-700 hover:text-white'}`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="text-blue-200 px-4 py-8">Loading {TAB_CONFIG.find(t => t.key === activeTab).label.toLowerCase()}...</div>
      ) : games.length === 0 ? (
        <div className="text-blue-300/70 text-sm px-4 py-6">No games available for this tab currently.</div>
      ) : (
        <GameCarousel
          games={games}
          onAddToWishlist={game => alert(`Added to wishlist: ${game.title || game.name}`)}
          onShowDetails={handleShowDetails}
        />
      )}
      {detailsGame && (
        <GameDetailsModal
          game={detailsGame}
          details={gameDetails}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}
