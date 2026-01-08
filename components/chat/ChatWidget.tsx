"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { ChatInput } from "./ChatInput";
import { ChatMessage, INITIAL_PROMPTS } from "./types";

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [prompts, setPrompts] = useState<string[]>(INITIAL_PROMPTS);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect and sync with document dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    // Initial check
    checkDarkMode();

    // Watch for changes using MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  // Initial Welcome Message (No Persistence)
  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hi there! 👋 I'm Swadhin's AI assistant (powered by Llama 3.3). I can answer questions about my projects, skills, and experience. What would you like to know?",
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  }, []);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      setPrompts([]);

      try {
        // Build message history for the API
        const history = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        // Check if response is streaming
        const contentType = response.headers.get("content-type");
        let botResponse = "";

        if (contentType?.includes("text/plain")) {
          // Streaming response
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              botResponse += decoder.decode(value, { stream: true });
            }
          }
        } else {
          // JSON response (fallback)
          const data = await response.json();
          botResponse = data.response || data.error || "No response";
        }

        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: botResponse,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMsg]);

        // Generate follow-up prompts based on response
        setPrompts(getFollowUpPrompts(content, botResponse));
      } catch (error) {
        console.error("Chat error:", error);
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I couldn't process that request. Please try again!",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        setPrompts(INITIAL_PROMPTS);
      } finally {
        setIsTyping(false);
      }
    },
    [messages]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`
            fixed z-40 flex flex-col
            bg-white/90 dark:bg-gray-900/60 backdrop-blur-2xl
            border border-gray-200/60 dark:border-white/10
            shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
            overflow-hidden
            ${isDarkMode ? "dark" : ""}
            ${
              isMobile
                ? "inset-0 w-full h-[100dvh] max-h-[100dvh] rounded-none"
                : "bottom-6 right-6 w-[380px] h-[600px] rounded-[32px]"
            }
          `}
        >
          <ChatHeader onClose={onClose} onMinimize={onClose} />

          <ChatMessages messages={messages} isTyping={isTyping} />

          <SuggestedPrompts
            prompts={prompts}
            onPromptClick={handleSendMessage}
            show={!isTyping}
          />

          <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper function to generate follow-up prompts
function getFollowUpPrompts(question: string, response: string): string[] {
  const q = question.toLowerCase();

  if (q.includes("project") || q.includes("work") || q.includes("built")) {
    return [
      "Show me your GitHub",
      "What tools did you use?",
      "How can I contact you?",
    ];
  }
  if (q.includes("tech") || q.includes("skill") || q.includes("stack")) {
    return [
      "What are you learning next?",
      "Show me your projects",
      "What's your experience?",
    ];
  }
  if (q.includes("contact") || q.includes("email") || q.includes("hire")) {
    return [
      "View my projects",
      "Tell me about yourself",
      "What's your experience?",
    ];
  }
  if (q.includes("experience") || q.includes("background")) {
    return [
      "View my projects",
      "What's your tech stack?",
      "How can I contact you?",
    ];
  }

  return INITIAL_PROMPTS;
}

export default ChatWidget;
