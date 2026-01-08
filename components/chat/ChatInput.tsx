"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled,
}) => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus when enabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [disabled]);

  // Scroll input into view when keyboard opens on mobile
  useEffect(() => {
    const handleFocus = () => {
      // Small delay to let keyboard animation start
      setTimeout(() => {
        inputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 300);
    };

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener("focus", handleFocus);
      return () => inputElement.removeEventListener("focus", handleFocus);
    }
  }, []);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const maxLength = 500;

  return (
    <div
      ref={containerRef}
      className="px-5 pb-4 pt-3 bg-transparent border-t-0 flex-shrink-0"
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask me anything..."
          aria-label="Chat message input"
          className="
            w-full pr-11 pl-4 py-2.5
            bg-white dark:bg-gray-800/50 backdrop-blur-sm
            border border-gray-200 dark:border-white/10
            rounded-[20px]
            text-[13px] text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500
            focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none focus:ring-0
            transition-colors shadow-sm
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          aria-label="Send message"
          className={`
            absolute right-1.5 top-1/2 -translate-y-1/2
            w-8 h-8 rounded-full flex items-center justify-center
            transition-all duration-200
            bg-blue-500 hover:bg-blue-600
            disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:opacity-40
          `}
        >
          <Send size={14} className="text-white" />
        </button>

        {input.length > 400 && (
          <span className="absolute bottom-[-1.25rem] right-1 text-[10px] text-gray-400 dark:text-gray-500">
            {input.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};
