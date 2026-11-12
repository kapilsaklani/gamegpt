import React, { useEffect, useState } from "react";
import FeedbackLoop from "./components/FeedbackLoop";
import { useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";
import { fetchFeedbackBackend } from "./api/feedback";

const developers = [
  { name: "Kapil Saklani", reg: "12310485" },
  { name: "Aryan Patidar", reg: "12303268" },
  { name: "Rohan Raj", reg: "12303760" },
];

export default function Home() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await fetchFeedbackBackend();
        if (Array.isArray(data)) {
          setReviews(data.filter(r => r.comment && r.comment.trim().length > 0));
        }
      } catch (err) {
        console.error("Error loading user feedback:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-[#181B23] text-gray-900 dark:text-blue-100">
      <HeroSection onStartChat={() => navigate('/chat')} />

      <div className="flex-1 flex flex-col items-center pt-12 pb-8">
        <div className="flex-1 flex flex-col items-center w-full max-w-5xl px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-8">
            What Gamers Are Saying
          </h2>

          {loading ? (
            <div className="text-blue-300 py-6">Loading community feedback...</div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl bg-[#10182A] border border-blue-900/40 p-8 text-center text-blue-300 max-w-md">
              <p className="mb-2">No community reviews submitted yet.</p>
              <p className="text-sm text-blue-400">Try our AI chatbot and submit your rating using the feedback form below!</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6 mb-8 w-full">
              {reviews.slice(0, 6).map((review) => (
                <div
                  key={review.id}
                  className="rounded-3xl bg-[#10182A] border border-blue-900/50 shadow-lg px-6 py-5 w-80 flex flex-col items-center text-center"
                >
                  <div className="flex text-yellow-400 text-lg mb-2">
                    {"★".repeat(review.rating)}{"☆".repeat(Math.max(0, 5 - review.rating))}
                  </div>
                  <p className="italic text-sm mb-3 text-blue-200">
                    "{review.comment}"
                  </p>
                  <span className="text-xs text-blue-400">
                    Verified Gamer Review • {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
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

      <FeedbackLoop />
    </div>
  );
}
