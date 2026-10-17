import React from "react";
import GameCard from "./GameCard";

export default function GameCarousel({ games, onShowMore, onAddToWishlist, onNext, onShowDetails }) {
  return (
    <div className="flex flex-col overflow-y-auto py-4 px-1 space-y-4 max-h-[70vh] scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
      {games.map((game, idx) => (
        <GameCard
          key={game.id || idx}
          game={game}
          onShowMore={onShowMore}
          onAddToWishlist={onAddToWishlist}
          onNext={onNext}
          onShowDetails={onShowDetails}
        />
      ))}
    </div>
  );
}
