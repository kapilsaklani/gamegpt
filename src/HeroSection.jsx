import React from "react";
import { useChat } from "./contexts/ChatContext";

function ThemeToggleButton() {
  const { theme, toggleTheme } = useChat();
  return (
    <button
      className="bg-[#181B23] border border-blue-400 px-3 py-1 rounded text-xs text-blue-900 dark:text-blue-100"
      onClick={toggleTheme}
      type="button"
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}

export default function HeroSection({ onStartChat }) {
  return (
    <section className="relative w-full bg-white dark:bg-[#181B23] pb-20 pt-10 px-4 flex flex-col items-center">
      <div className="max-w-6xl w-full flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex-1 flex flex-col items-start md:items-start max-w-xl">
          <span className="uppercase tracking-widest text-blue-600 dark:text-blue-300 font-semibold mb-2 text-sm">AI Game Chatbot</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            Discover Your Next <br />
            <span className="text-blue-700 dark:text-blue-400">Favorite Game</span>
          </h1>
          <p className="text-blue-900 dark:text-blue-100 mb-6 text-lg">
            Personalized recommendations, trending titles, and hidden gems—powered by AI. Chat naturally and let your next adventure begin!
          </p>
          <div className="flex flex-wrap gap-4 mb-3">
            <button
              className="bg-gradient-to-r from-blue-500 to-purple-400 hover:from-blue-600 hover:to-purple-500 text-gray-900 dark:text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg transition-all"
              onClick={onStartChat}
            >
              Start Chatting Now
            </button>
            <button
              className="border border-blue-300 text-blue-900 dark:text-blue-100 hover:bg-blue-800 px-6 py-3 rounded-full font-bold text-lg transition-all"
            >
              Explore Features
            </button>
          </div>
          <div className="flex items-center mt-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            <span className="text-blue-700 dark:text-blue-200 text-sm">Joined by 10,000+ gamers</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center mt-10 md:mt-0">
          <div className="rounded-3xl border border-blue-400 bg-[#10182A] px-8 py-6 w-full max-w-md shadow-lg">
            <span className="text-green-300 font-mono text-xs">chatbot.js</span>
            <pre className="mt-2 text-blue-900 dark:text-blue-100 text-sm font-mono whitespace-pre-wrap leading-relaxed">
&gt; User: Suggest me a fun RPG game
Bot: Sure! Try "The Witcher 3: Wild Hunt" or "Persona 5". Both are highly rated RPGs loved by gamers.

&gt; User: Any trending games?
Bot: "Elden Ring" and "Hades" are trending right now! Want more details?
            </pre>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center mt-16">
        <button className="bg-[#23263a] hover:bg-blue-700 text-blue-600 dark:text-blue-300 rounded-full p-3 shadow-lg text-2xl transition-all">
          <span className="inline-block animate-bounce">⌄</span>
        </button>
      </div>
      <div className="absolute top-6 right-8">
        <ThemeToggleButton />
      </div>
    </section>
  );
}
