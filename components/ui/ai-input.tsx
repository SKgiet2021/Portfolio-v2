"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import GlassSurface from "@/components/ui/glass-surface";
import { ChatWidget } from "@/components/chat/ChatWidget";

interface MorphPanelProps {
  className?: string;
}

export function MorphPanel({ className }: MorphPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Fixed Ask AI Button */}
      <div
        className={cn(
          "fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40",
          className
        )}
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <GlassSurface
                width="auto"
                height={48}
                borderRadius={24}
                className="cursor-pointer hover:scale-105 transition-transform px-4 py-2.5"
              >
                <button
                  onClick={() => setIsOpen(true)}
                  className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors"
                  aria-label="Ask AI"
                >
                  {/* Animated AI Icon */}
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>

                  {/* Text - hidden on mobile */}
                  <span className="hidden sm:inline text-sm font-medium">
                    Ask AI
                  </span>
                </button>
              </GlassSurface>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Widget Popup */}
      <ChatWidget isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
