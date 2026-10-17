import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchChatSessions, createChatSession, sendChatMessageToBackend } from "../api/chats";

const ChatContext = createContext();

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [isTyping, setIsTyping] = useState(false);

  // Initialize theme class on <html>
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Load chat sessions from Django PostgreSQL Backend
  const loadSessions = useCallback(async () => {
    const sessions = await fetchChatSessions();
    if (sessions && sessions.length > 0) {
      setChats(sessions);
      if (!activeChatId) {
        setActiveChatId(sessions[0].id);
      }
    } else {
      // Create initial chat session if none exists
      const newSession = await createChatSession();
      if (newSession) {
        setChats([newSession]);
        setActiveChatId(newSession.id);
      } else {
        // Fallback local initial chat
        const defaultChat = { id: 1, title: "Chat 1", messages: [] };
        setChats([defaultChat]);
        setActiveChatId(1);
      }
    }
  }, [activeChatId]);

  useEffect(() => {
    loadSessions();
  }, []);

  // Format messages helper
  const activeChat = chats.find(c => c.id === activeChatId);
  const rawMessages = Array.isArray(activeChat?.messages) ? activeChat.messages : [];
  const chatHistory = rawMessages.map(msg => ({
    ...msg,
    role: msg.role,
    parts: msg.parts || [{ text: msg.text || "" }]
  }));

  // Local setChatHistory override (used for immediate UI updates / fallback)
  const setChatHistory = (messages) => {
    setChats(prev => prev.map(chat =>
      chat.id === activeChatId ? { ...chat, messages } : chat
    ));
  };

  // Send a message via Backend and update state from DB response
  const sendMessage = async (input) => {
    if (!activeChatId) return;
    setIsTyping(true);

    // Optimistic local add
    const userMsg = { role: "user", parts: [{ text: input }] };
    setChatHistory([...chatHistory, userMsg]);

    try {
      const result = await sendChatMessageToBackend(activeChatId, input);
      if (result && result.session) {
        setChats(prev => prev.map(chat =>
          chat.id === activeChatId ? result.session : chat
        ));
      }
    } catch (e) {
      console.error("Backend message send error:", e);
      // Fallback response if offline
      setChatHistory([
        ...chatHistory,
        userMsg,
        { role: "model", parts: [{ text: "Sorry, error communicating with server." }] }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Create new chat in Django Backend
  const newChat = async () => {
    const newSession = await createChatSession();
    if (newSession) {
      setChats(prev => [newSession, ...prev]);
      setActiveChatId(newSession.id);
    } else {
      const newId = chats.length > 0 ? Math.max(...chats.map(c => c.id)) + 1 : 1;
      const newChatObj = { id: newId, title: `Chat ${newId}`, messages: [] };
      setChats(prev => [newChatObj, ...prev]);
      setActiveChatId(newId);
    }
  };

  const switchChat = (id) => {
    setActiveChatId(id);
  };

  const chatList = chats.map(({ id, title }) => ({ id, title }));
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ChatContext.Provider value={{
      chatHistory, setChatHistory, sendMessage, theme, toggleTheme, newChat, isTyping, setIsTyping, chatList, activeChatId, switchChat
    }}>
      {children}
    </ChatContext.Provider>
  );
}
