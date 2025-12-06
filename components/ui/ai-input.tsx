import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import AIChatCard from "./ai-chat";
import { cn } from "@/lib/utils";
import GlassSurface from "@/components/ui/glass-surface";

interface MorphPanelProps {
  className?: string;
}

export function MorphPanel({ className }: MorphPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40", className)}>
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
                <span className="hidden sm:inline text-sm font-medium">Ask AI</span>
              </button>
            </GlassSurface>
          </motion.div>
        )}

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative"
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-3 -right-3 z-50 p-2 rounded-full bg-background border border-border hover:bg-muted transition-colors"
              aria-label="Close AI Chat"
            >
              <X className="w-4 h-4" />
            </button>

            <AIChatCard className="w-[90vw] sm:w-96 h-[70vh] sm:h-[500px]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
