"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";

const dotVariants = {
  initial: { y: 0 },
  animate: { y: -4 },
};

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mt-1 transition-colors">
        <Bot size={14} className="text-blue-500 dark:text-blue-400" />
      </div>

      <div
        className="
        bg-white dark:bg-gray-800/60 backdrop-blur-sm 
        border border-gray-100 dark:border-white/10
        px-4 py-3 
        rounded-[20px] rounded-bl-md 
        shadow-sm dark:shadow-none 
        flex items-center gap-1.5 h-[38px]
        transition-colors
      "
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 0.5,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
            className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"
          />
        ))}
      </div>
    </div>
  );
};
