import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { fetchGamesByGenre, fetchTopRatedGames } from './rawg.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function generateSmartGameReply(userText) {
  const textLower = userText.toLowerCase();

  // Greetings check
  if (['hi', 'hello', 'hey', 'sup', 'greetings'].some(g => textLower.includes(g))) {
    return (
      "Hello gamer! 🎮 Welcome to **GameBot**.\n\n" +
      "What kind of games are you looking for today? " +
      "You can click a genre tag above, ask for recommendations (e.g. *\"Suggest me good RPG games\"*), " +
      "or compare games (e.g. *\"compare Witcher 3 and Skyrim\"*)!"
    );
  }

  // Detect genre keywords
  const genres = ['rpg', 'action', 'adventure', 'shooter', 'strategy', 'sports', 'puzzle', 'racing', 'simulation', 'indie'];
  const matchedGenre = genres.find(g => textLower.includes(g));

  if (matchedGenre) {
    try {
      const results = await fetchGamesByGenre(matchedGenre, 4);
      if (results && results.length > 0) {
        const lines = [`Here are top-rated **${matchedGenre.toUpperCase()}** games you should check out:\n`];
        results.forEach((game, idx) => {
          const name = game.name || 'Unknown Game';
          const rating = game.rating || 'N/A';
          const platforms = (game.platforms || [])
            .slice(0, 3)
            .map(p => p.platform?.name)
            .filter(Boolean)
            .join(', ');
          lines.push(`${idx + 1}. **${name}** — ★ ${rating}/5`);
          if (platforms) {
            lines.push(`   *Platforms*: ${platforms}`);
          }
        });
        lines.push('\nWould you like more recommendations or details on any of these?');
        return lines.join('\n');
      }
    } catch (e) {
      // Continue to next fallback
    }
  }

  // Generic top-rated fallback from RAWG
  try {
    const topGames = await fetchTopRatedGames(3);
    if (topGames && topGames.length > 0) {
      const lines = [`Here are some top-rated game recommendations for **"${userText}"**:\n`];
      topGames.forEach((game, idx) => {
        lines.push(`${idx + 1}. **${game.name || game.title}** — Rating: ★ ${game.rating}/5`);
      });
      return lines.join('\n');
    }
  } catch (e) {
    // Continue
  }

  return `I found several exciting gaming avenues related to "${userText}". Try browsing through our genre tags or ask about specific game categories like Action, RPG, or Indie!`;
}

export async function generateAIChatReply(pastMessages, userText) {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not configured; using smart game recommendation engine.');
    return await generateSmartGameReply(userText);
  }

  // Build contents array for Gemini
  const contents = pastMessages.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text || '' }],
  }));

  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];

  for (const modelName of models) {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    try {
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        const extracted = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (extracted) {
          return extracted;
        }
      }
    } catch (err) {
      console.warn(`Gemini (${modelName}) failed or timed out:`, err.message);
    }
  }

  // Fallback if all Gemini models fail / rate limited
  return await generateSmartGameReply(userText);
}
