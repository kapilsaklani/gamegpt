import React, { useEffect, useState } from "react";
import GameCarousel from "./GameCarousel";
import GameDetailsModal from "./GameDetailsModal";
import { fetchPopularGames } from "../api/rawg";

const RAWG_API_KEY = "82f9e3d47f5a4fc58029006cc7b43b8d"; // Replace this with your real key


const trendingFallback = [
  { id: 1, title: "Palworld", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/header.jpg", rating: 9.2 },
  { id: 2, title: "Helldivers 2", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/553850/header.jpg", rating: 9.1 },
  { id: 3, title: "Final Fantasy VII Rebirth", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1462040/header.jpg", rating: 9.0 },
  { id: 4, title: "Dragon's Dogma 2", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/2054970/header.jpg", rating: 8.8 },
  { id: 5, title: "Tekken 8", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1778820/header.jpg", rating: 8.7 },
];
const newReleasesFallback = [
  { id: 10, title: "Stellar Blade", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/2138330/header.jpg", rating: 8.9 },
  { id: 11, title: "Eiyuden Chronicle: Hundred Heroes", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1656850/header.jpg", rating: 8.7 },
  { id: 12, title: "Sand Land", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1742020/header.jpg", rating: 8.5 },
  { id: 13, title: "No Rest for the Wicked", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1561040/header.jpg", rating: 8.3 },
  { id: 14, title: "Princess Peach: Showtime!", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/2469300/header.jpg", rating: 8.2 },
];
const editorsPicks = [
  { id: 7, title: "Hades", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg", rating: 9.3 },
  { id: 8, title: "Celeste", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/header.jpg", rating: 9.0 },
  { id: 9, title: "The Witcher 3", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg", rating: 9.5 },
];

const TAB_CONFIG = [
  { key: 'trending', label: 'Trending', fallback: trendingFallback, fetch: async () => await fetchPopularGames(RAWG_API_KEY, 5, '-added') }, // trending by popularity
  { key: 'new', label: 'New Releases', fallback: newReleasesFallback, fetch: async () => newReleasesFallback }, // always use curated list
  { key: 'editors', label: "Editor's Picks", fallback: editorsPicks, fetch: async () => editorsPicks },
];

export default function PopularGamesSidebar() {
  const [activeTab, setActiveTab] = useState('trending');
  const [games, setGames] = useState(trendingFallback);
  const [loading, setLoading] = useState(true);
  const [detailsGame, setDetailsGame] = useState(null);
  const [gameDetails, setGameDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  async function fetchGameDetails(game) {
    setDetailsLoading(true);
    setGameDetails(null);
    setDetailsGame(game);
    try {
      // Try to get details from RAWG API if id is present
      if (game.id && typeof game.id === 'number') {
        const res = await fetch(`https://api.rawg.io/api/games/${game.id}?key=${RAWG_API_KEY}`);
        if (res.ok) {
          const data = await res.json();
          setGameDetails(data);
        } else {
          setGameDetails(null);
        }
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
        const res = await tab.fetch();
        setGames(res);
      } catch (e) {
        setGames(tab.fallback);
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
      ) : (
        <GameCarousel
          games={games}
          onAddToWishlist={game => alert(`Added to wishlist: ${game.title}`)}
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
