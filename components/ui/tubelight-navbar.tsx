"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import GlassSurface from "@/components/ui/glass-surface"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.name ?? "")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Simple scroll-spy: just find which section is most in view
  useEffect(() => {
    const handleScroll = () => {
      const sections = items.map((item) => {
        const id = item.url.replace("#", "")
        return {
          name: item.name,
          element: document.getElementById(id),
        }
      })

      // Find section closest to top of viewport
      let currentSection = items[0].name

      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect()
          // If section top is above middle of screen, it's the active one
          if (rect.top <= window.innerHeight / 2 && rect.bottom > 0) {
            currentSection = section.name
          }
        }
      }

      setActiveTab(currentSection)
    }

    // Throttle scroll events (call at most once per 100ms)
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", throttledScroll, { passive: true })
    handleScroll() // Run once on mount

    return () => window.removeEventListener("scroll", throttledScroll)
  }, [items])

  if (!items.length) return null

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-4 sm:top-4 sm:bottom-auto flex justify-center z-50 pointer-events-none",
        className,
      )}
    >
      <GlassSurface
        width="auto"
        height={56}
        borderRadius={26}
        backgroundOpacity={0.05}
        saturation={1.4}
        blur={12}
        className="pointer-events-auto px-2.5"
      >
        <div className="relative flex items-center gap-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name

            return (
              <Link
                key={item.name}
                href={item.url}
                className={cn(
                  "relative flex items-center justify-center gap-1.5",
                  "px-4 sm:px-5 py-2 rounded-2xl",
                  "text-xs sm:text-sm font-medium",
                  "text-foreground/70 hover:text-foreground transition-colors",
                  isActive && "text-foreground",
                )}
              >
                {!isMobile && <span>{item.name}</span>}
                {isMobile && <Icon size={18} strokeWidth={2.1} />}

                {isActive && (
                  <motion.div
                    layoutId="liquid-glass-pill"
                    className="absolute inset-0 -z-10 rounded-2xl overflow-hidden"
                    initial={false}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  >
                    <div
                      className="absolute inset-[1px] rounded-[18px] backdrop-blur-3xl"
                      style={{
                        background:
                          "radial-gradient(circle_at_0%_0%, rgba(255,255,255,0.9), transparent 55%), var(--glass-bg-strong)",
                        border: "1px solid var(--glass-border)",
                      }}
                    />
                    <div
                      className="absolute inset-x-1 top-0 h-1.5 rounded-full blur-[3px]"
                      style={{ background: "var(--glass-inner-highlight)" }}
                    />
                    <div
                      className="pointer-events-none absolute -inset-[1px] rounded-[inherit] opacity-60 mix-blend-screen"
                      style={{
                        background:
                          "conic-gradient(from 210deg at 50% 0%, var(--glass-fringe-blue), transparent 40%, var(--glass-fringe-purple), transparent 80%, var(--glass-fringe-blue))",
                      }}
                    />
                  </motion.div>
                )}
              </Link>
            )
          })}
        </div>
      </GlassSurface>
    </div>
  )
}
