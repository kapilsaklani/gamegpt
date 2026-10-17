import React from "react";
import FeedbackLoop from "./components/FeedbackLoop";
import { useNavigate } from "react-router-dom";
import { useChat } from "./contexts/ChatContext";
import HeroSection from "./HeroSection";


function ThemeToggleButton() {
  const { theme, toggleTheme } = useChat();
  return (
    <button
      className="bg-[#181B23] border border-blue-400 px-3 py-1 rounded text-xs text-blue-600 dark:text-blue-300"
      onClick={toggleTheme}
      type="button"
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}

const testimonials = [
  {
    name: "Ananya",
    text: "'I found so many cool indie games I never would have tried! The chatbot is super friendly.'",
    img: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    name: "Rahul",
    text: "'Best way to get game recommendations. Fast, easy, and spot on for my style.'",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Priya",
    text: "'Love the clean UI and how it remembers my favorite genres!'",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Siddharth",
    text: "'The chatbot feels like a real gamer friend. Highly recommend!'",
    img: "https://randomuser.me/api/portraits/men/51.jpg",
  },
];

const developers = [
  { name: "Kapil Saklani", reg: "12310485" },
  { name: "Aryan Patidar", reg: "12303268" },
  { name: "Rohan Raj", reg: "12303760" },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-[#181B23] text-gray-900 dark:text-blue-100">
      <HeroSection onStartChat={() => navigate('/chat')} />
      <div className="flex-1 flex flex-col items-center pt-12 pb-8">
        {/* Left: Testimonials */}
        <div className="flex-1 flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-8">What Gamers Are Saying</h2>
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {testimonials.slice(0, 3).map((t, i) => (
              <div key={i} className="rounded-3xl bg-[#10182A] shadow-lg px-8 py-6 w-80 flex flex-col items-center text-center">
                <img src={t.img} alt={t.name} className="w-14 h-14 rounded-full mb-3 border-2 border-blue-400" />
                <p className="italic text-sm mb-2 text-blue-600 dark:text-blue-300">{t.text}</p>
                <span className="text-blue-700 dark:text-blue-400 font-medium text-sm">{t.name}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {testimonials.slice(3, 4).map((t, i) => (
              <div key={i} className="rounded-3xl bg-[#10182A] shadow-lg px-8 py-6 w-80 flex flex-col items-center text-center">
                <img src={t.img} alt={t.name} className="w-14 h-14 rounded-full mb-3 border-2 border-blue-400" />
                <p className="italic text-sm mb-2 text-blue-600 dark:text-blue-300">{t.text}</p>
                <span className="text-blue-700 dark:text-blue-400 font-medium text-sm">{t.name}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 mb-10">
            <button className="bg-blue-700 hover:bg-blue-800 text-gray-900 dark:text-white px-4 py-2 rounded-full shadow-lg text-lg font-bold transition-all">↓</button>
          </div>
        </div>

      </div>
      <footer className="bg-[#10182A] py-8 flex flex-col items-center">
        <h3 className="text-blue-700 dark:text-blue-400 text-xl font-bold mb-4">Website Developers</h3>
        <div className="flex flex-wrap justify-center gap-6">
          {developers.map((dev, i) => (
            <div key={i} className="rounded-2xl border border-blue-400 px-8 py-4 text-center bg-[#181B23] w-64">
              <span className="font-bold text-gray-900 dark:text-white text-lg block mb-1">{dev.name}</span>
              <span className="text-blue-700 dark:text-blue-200 text-sm">Reg No: {dev.reg}</span>
            </div>
          ))}
        </div>
      </footer>
      <div className="absolute top-6 right-8">

      </div>
      <FeedbackLoop />
    </div>
  );
}
