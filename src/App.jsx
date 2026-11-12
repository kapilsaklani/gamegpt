import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ChatProvider, useChat } from "./contexts/ChatContext";
import ChatWindow from "./components/ChatWindow";
import InputBar from "./components/InputBar";
import Home from "./Home";
import Wishlist from "./components/Wishlist";

function Sidebar() {
  const { chatList, activeChatId, switchChat, newChat } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <aside className="w-56 bg-[#181B23] text-blue-100 flex flex-col h-full border-r border-gray-800">
      <div className="p-4 flex flex-col gap-2">
        <span className="font-bold text-lg text-blue-400">GameBot</span>
        {location.pathname === "/chat" && (
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded py-2 mt-2 w-full"
            onClick={() => navigate("/")}
          >
            ← Back to Homepage
          </button>
        )}
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded py-2 mt-2" onClick={newChat}>+ NEW CHAT</button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {chatList.map((chat, idx) => (
          <div
            key={chat.id}
            className={`rounded px-3 py-2 mb-1 cursor-pointer ${chat.id === activeChatId ? 'bg-[#23263a] text-blue-300' : 'hover:bg-[#23263a]'}`}
            onClick={() => switchChat(chat.id)}
          >
            {chat.title}
          </div>
        ))}
      </div>
    </aside>
  );
}

function GenreFilterBar({ onGenreClick, loading }) {
  const genres = ["Action", "Adventure", "Rpg", "Shooter", "Strategy", "Sports", "Puzzle", "Racing", "Simulation"];
  return (
    <div className="flex flex-wrap gap-2 px-4 pt-4 pb-2 bg-transparent">
      {genres.map((genre) => (
        <button
          key={genre}
          className="px-3 py-1 rounded-full bg-[#23263a] text-blue-100 hover:bg-blue-600 hover:text-white text-sm font-medium transition-all disabled:opacity-60"
          onClick={() => onGenreClick(genre)}
          disabled={loading}
          type="button"
        >
          {genre}
        </button>
      ))}
    </div>
  );
}

import GameCarousel from "./components/GameCarousel";
import PopularGamesSidebar from "./components/PopularGamesSidebar";

function AppContent() {
  const { chatHistory, setChatHistory, isTyping, setIsTyping, sendMessage } = useChat();
  const [genreLoading, setGenreLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenreClick = async (genre) => {
    if (isTyping || genreLoading) return;
    const prompt = `Suggest me some good ${genre} games.`;
    setGenreLoading(true);
    try {
      if (sendMessage) {
        await sendMessage(prompt);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenreLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f9fafb] dark:bg-[#181B23]">
      {/* Sidebar */}
      <Sidebar />
      {/* Main chat area */}
      <main className="flex flex-1 flex-col lg:flex-row">
        {/* Center chat section */}
        <section className="flex-1 flex flex-col items-center justify-start py-8 px-4">
          <GenreFilterBar onGenreClick={handleGenreClick} loading={genreLoading} />
          <div className="flex flex-col flex-1 w-full max-w-2xl mt-4 rounded-xl bg-gray-100 dark:bg-[#23263a] shadow-lg min-h-[500px]">
            <ChatWindow />
            <InputBar />
          </div>
        </section>
        {/* Right sidebar: Popular Games */}
        <aside className="hidden lg:flex flex-col w-80 pl-4 pt-12 bg-[#23263a] border-l border-blue-900">
          <PopularGamesSidebar />
        </aside>
      </main>
    </div>
  );
}

function ChatbotPage() {
  return <AppContent />;
}

export default function App() {
  return (
    <ChatProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeButtonWrapper />} />
          <Route path="/chat" element={<ChatbotPage />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>
      </BrowserRouter>
    </ChatProvider>
  );
}

function HomeButtonWrapper() {
  const navigate = useNavigate();
  return (
    <div>
      <Home />
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4 items-end">
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg text-lg font-bold transition-all" onClick={() => navigate('/wishlist')}>
          View Wishlist
        </button>
      </div>
    </div>
  );
}
