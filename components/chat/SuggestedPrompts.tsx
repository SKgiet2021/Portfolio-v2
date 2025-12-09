"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";

interface SuggestedPromptsProps {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
  show: boolean;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  prompts,
  onPromptClick,
  show,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Convert vertical scroll to horizontal
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current && e.deltaY !== 0) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  if (!show || prompts.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      onWheel={handleWheel}
      className="px-5 pb-2 flex gap-2 overflow-x-auto py-2 flex-shrink-0 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
      style={{ scrollbarWidth: "none" }}
    >
      {prompts.map((prompt, index) => (
        <motion.button
          key={`${prompt}-${index}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onPromptClick(prompt)}
          className="
            whitespace-nowrap px-4 py-2 rounded-full
            bg-white dark:bg-gray-800/80
            border border-gray-200 dark:border-white/10
            text-[12px] font-normal text-gray-600 dark:text-gray-300
            shadow-sm dark:shadow-none
            hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700
            transition-all duration-200
            focus:outline-none
          "
        >
          {prompt}
        </motion.button>
      ))}
    </div>
  );
};
