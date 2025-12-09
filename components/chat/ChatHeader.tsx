"use client";

import React from "react";
import { Bot, X, Minus } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
  onMinimize: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClose,
  onMinimize,
}) => {
  return (
    <div className="h-14 px-5 py-3 flex items-center justify-between bg-transparent flex-shrink-0">
      {/* Left Side: Avatar & Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors">
          <Bot size={16} className="text-gray-600 dark:text-gray-300" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-medium text-sm text-gray-700 dark:text-gray-200 transition-colors">
            Swadhin AI
          </h3>
        </div>
      </div>

      {/* Right Side: Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onMinimize}
          aria-label="Minimize chat"
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
        >
          <Minus size={18} />
        </button>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
