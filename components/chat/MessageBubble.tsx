"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { ChatMessage, formatTime } from "./types";

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
  isLast: boolean;
}

const useTypingEffect = (
  text: string,
  speed: number = 20,
  isEnabled: boolean
) => {
  const [displayedText, setDisplayedText] = useState(isEnabled ? "" : text);

  useEffect(() => {
    if (!isEnabled) {
      setDisplayedText(text);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, isEnabled]);

  return displayedText;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  index,
  isLast,
}) => {
  const isUser = message.role === "user";
  const shouldType = !isUser && isLast;
  const content = useTypingEffect(message.content, 15, shouldType);

  const renderContent = (text: string) => {
    return text.split("\n").map((str, i) => (
      <React.Fragment key={i}>
        {str.split("**").map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j} className="font-semibold">
              {part}
            </strong>
          ) : (
            part
          )
        )}
        {i !== text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex w-full mb-3 ${
        isUser ? "justify-end" : "justify-start items-start gap-2"
      }`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mt-1 transition-colors">
          <Bot size={14} className="text-blue-500 dark:text-blue-400" />
        </div>
      )}

      <div
        className={`flex flex-col ${
          isUser ? "items-end" : "items-start"
        } max-w-[75%]`}
      >
        <div
          className={`
            px-3.5 py-2.5 text-[13px] leading-relaxed transition-colors
            ${
              isUser
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-[20px] rounded-br-md shadow-sm"
                : "bg-white dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-200 rounded-[20px] rounded-bl-md shadow-sm dark:shadow-none"
            }
          `}
        >
          {renderContent(content)}
        </div>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 mx-1 transition-colors">
          {formatTime(new Date(message.timestamp))}
        </span>
      </div>
    </motion.div>
  );
};
