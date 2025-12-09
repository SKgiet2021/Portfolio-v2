"use client";

import React, { useRef, useEffect } from "react";
import { ChatMessage } from "./types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isTyping,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  return (
    <div
      className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-3 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
      style={{ scrollbarWidth: "none" }}
      role="log"
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="space-y-3">
        {messages.map((msg, index) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            index={index}
            isLast={index === messages.length - 1}
          />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={scrollRef} />
      </div>
    </div>
  );
};
