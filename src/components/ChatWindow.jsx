import React, { useRef, useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../contexts/ChatContext";

import CompareGamesModal from "./CompareGamesModal";
import { marked } from "marked";

// Fallback/popular games for the right sidebar
const fallbackGames = [
  { id: 1, title: "The Witcher 3", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg", rating: 9.5 },
  { id: 2, title: "Celeste", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/header.jpg", rating: 9.0 },
  { id: 3, title: "Hades", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg", rating: 9.3 },
];

function ChatBubble({ role, text }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={
          `px-4 py-3 rounded-2xl max-w-[75%] shadow-md whitespace-pre-line ` +
          (isUser
            ? "bg-blue-600 text-white rounded-br-md rounded-tl-2xl rounded-tr-2xl self-end"
            : "bg-gray-100 dark:bg-[#29304a] text-gray-900 dark:text-blue-100 rounded-bl-md rounded-tl-2xl rounded-tr-2xl self-start border border-gray-200 dark:border-[#29304a]")
        }
        dangerouslySetInnerHTML={!isUser ? { __html: marked.parse(text) } : undefined}
      >
        {isUser ? text : null}
      </div>
    </div>
  );
}


export default function ChatWindow() {
  const { chatHistory, isTyping } = useChat();
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [compareGames, setCompareGames] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  // Listen for compare games event from InputBar
  useEffect(() => {
    function handleShowCompareGames(e) {
      setCompareGames(e.detail);
      setShowCompare(true);
    }
    window.addEventListener("showCompareGames", handleShowCompareGames);
    return () => window.removeEventListener("showCompareGames", handleShowCompareGames);
  }, []);
  // Handlers for quick reply buttons
  const handleShowMore = useCallback((game) => {
    alert(`Show more about: ${game.title}`);
    // Implement modal or detailed view logic here
  }, []);
  const handleAddToWishlist = useCallback((game) => {
    alert(`Added to wishlist: ${game.title}`);
    // Implement wishlist logic here
  }, []);
  const handleNext = useCallback((game) => {
    alert(`Next recommendation after: ${game.title}`);
    // Implement next game logic here
  }, []);

  // Find if there's a special game recommendation message
  const gameRecMsg = chatHistory.find(msg => msg.type === 'game_recommendations');
  const games = gameRecMsg?.games || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  return (
    <>
      <div className="flex flex-col flex-1 w-full max-w-2xl mt-4 rounded-xl bg-white dark:bg-[#23283a] shadow-lg min-h-[500px] h-[70vh]">
        <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
          {chatHistory.map((msg, idx) => (
            <ChatBubble key={idx} role={msg.role} text={msg.parts[0].text} />
          ))}
          {isTyping && (
            <div className="flex justify-start mb-2">
              <div className="px-4 py-3 rounded-2xl bg-gray-200 dark:bg-[#23263a] text-gray-900 dark:text-blue-100 shadow-md flex items-center gap-2">
                <span className="sr-only">Gemini is typing</span>
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      {showCompare && (
        <CompareGamesModal games={compareGames} onClose={() => setShowCompare(false)} />
      )}
    </>
  );
}
