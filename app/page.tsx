"use client";

import { NavBar } from "@/components/ui/tubelight-navbar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  Home,
  User,
  Briefcase,
  FileText,
  Code,
  Box,
  Lock,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";

import { AboutSection } from "@/components/sections/AboutSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { useRouter } from "next/navigation";
import { GooeyText } from "@/components/ui/gooey-text-morphing";
import { DigitalRainCanvas } from "@/components/ui/digital-rain";
import { MorphPanel } from "@/components/ui/ai-input";
import { useMotionValue } from "framer-motion";
import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import {
  CardPattern,
  generateRandomString,
} from "@/components/ui/evervault-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { SmoothCursor } from "@/components/ui/smooth-cursor";

// Hero title options (defined outside component to prevent recreation)
const HERO_TITLES = ["beautiful", "smart", "new", "amazing", "wonderful"];

// Memoized hero component - pure presentation, no props changing
const SimpleHero = memo(function SimpleHero() {
  return (
    <div className="w-full relative z-10 px-4 sm:px-6 md:px-8">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col items-center">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-blue-600 dark:text-blue-400">
                Crafting Intelligence
              </span>
              <div className="relative flex w-full justify-center overflow-visible text-center pt-2 pb-2 mt-7 min-h-[100px] whitespace-nowrap">
                <GooeyText
                  texts={[
                    "with Style",
                    "with Data",
                    "with Design",
                    "with Logic",
                  ]}
                  morphTime={1}
                  cooldownTime={0.25}
                  className="font-bold"
                  textClassName="text-5xl md:text-7xl font-bold text-foreground"
                />
              </div>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center relative z-10 px-4">
              I bridge the gap between complex algorithms and beautiful
              interfaces. As a <strong>Data Science</strong> student passionate
              about <strong>UI/UX</strong>, I build smart applications that feel
              alive and look exceptional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

interface SimpleGridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  onClick?: () => void;
}

// Memoized grid item component with optimized mouse handling
const SimpleGridItem = memo(function SimpleGridItem({
  area,
  icon,
  title,
  description,
  onClick,
}: SimpleGridItemProps) {
  const isMobile = useIsMobile();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const lastUpdateRef = useRef(0);
  const randomStringRef = useRef(generateRandomString(1500));

  const [randomString, setRandomString] = useState(
    () => randomStringRef.current
  );

  // Throttled mouse move handler - only update every 100ms max
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile) return;

      const { left, top } = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - left);
      mouseY.set(e.clientY - top);

      // Throttle random string generation to every 100ms
      const now = Date.now();
      if (now - lastUpdateRef.current > 100) {
        lastUpdateRef.current = now;
        const str = generateRandomString(1500);
        randomStringRef.current = str;
        setRandomString(str);
      }
    },
    [isMobile, mouseX, mouseY]
  );

  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div
        className="relative h-full cursor-pointer group/card rounded-[1.25rem]"
        onClick={onClick}
        onMouseMove={handleMouseMove}
      >
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />

        {/* Card Content */}
        <div className="relative h-full rounded-[1.25rem] bg-card border border-border transition-all group-hover/card:shadow-2xl overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <CardPattern
              mouseX={mouseX}
              mouseY={mouseY}
              randomString={randomString}
              isMobile={isMobile}
            />
          </div>
          <div className="flex h-full flex-col justify-between gap-6 p-6 relative z-10">
            <div className="relative z-10 flex flex-1 flex-col justify-between gap-3">
              <div className="w-fit rounded-lg border border-border bg-muted p-2">
                {icon}
              </div>
              <div className="space-y-3">
                <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                  {title}
                </h3>
                <h2 className="font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                  {description}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
});

// Navigation items defined outside component to prevent recreation
const NAV_ITEMS = [
  { name: "Home", url: "#home", icon: Home },
  { name: "About", url: "#about", icon: User },
  { name: "Skills", url: "#skills", icon: Code },
  { name: "Projects", url: "#projects", icon: Briefcase },
  { name: "Contact", url: "#contact", icon: FileText },
];

export default function HomePage() {
  const router = useRouter();
  const isMobile = useIsMobile();

  // Memoized click handlers to prevent recreation on each render
  const handleProjectClick = useCallback(
    (projectId: number) => () => router.push(`/project/${projectId}`),
    [router]
  );

  return (
    <div className="min-h-screen bg-background font-sans antialiased relative">
      {/* Smooth Cursor - disabled on mobile */}
      <SmoothCursor
        color="currentColor"
        size={20}
        glowEffect
        scaleOnClick
        rotateOnMove
        hideOnLeave
        disabled={isMobile}
      />

      {/* Digital Rain Background */}
      <DigitalRainCanvas />

      <NavBar items={NAV_ITEMS} />

      {/* Theme Toggle - positioned in top-right */}
      <div className="fixed top-4 right-4 z-50">
        <AnimatedThemeToggler className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors" />
      </div>

      <main className="flex flex-col items-center justify-center w-full relative z-10 px-4 sm:px-6 md:px-8">
        <section id="home" className="w-full">
          <SimpleHero />
        </section>

        <AboutSection />
        <SkillsSection />

        {/* Featured Projects Section - Simple cards without animations */}
        <section id="projects" className="w-full max-w-6xl py-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center text-foreground">
            Featured Projects
          </h2>
          <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
            <SimpleGridItem
              area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
              icon={<Box className="h-4 w-4" />}
              title="GeoSpatial Forecaster"
              description="Satellite imagery analysis using TensorFlow for precise rainfall prediction."
              onClick={handleProjectClick(1)}
            />
            <SimpleGridItem
              area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
              icon={<Settings className="h-4 w-4" />}
              title="Credit Risk Intelligence"
              description="Predictive financial modeling dashboard for assessing loan repayment probabilities."
              onClick={handleProjectClick(2)}
            />
            <SimpleGridItem
              area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
              icon={<Lock className="h-4 w-4" />}
              title="Desktop Automation Core"
              description="Python-based intelligent assistant for cross-platform workflow automation."
              onClick={handleProjectClick(3)}
            />
            <SimpleGridItem
              area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
              icon={<Sparkles className="h-4 w-4" />}
              title="Web Security Scanner"
              description="Automated vulnerability assessment tool for XSS and SQL injection detection."
              onClick={handleProjectClick(4)}
            />
            <SimpleGridItem
              area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
              icon={<Search className="h-4 w-4" />}
              title="RAG AI Architecture"
              description="This Portfolio! A Next.js 15 system with Neural Search (LanceDB), Llama 3.3 integration, and modular provider switching."
              onClick={() =>
                window.open("https://github.com/swadhinkumar2004", "_blank")
              }
            />
          </ul>
        </section>

        <ContactSection />
      </main>

      {/* RAG Chatbot */}
      {/* RAG Chatbot UI */}
      <div className="fixed bottom-4 right-24 z-50">
        <MorphPanel />
      </div>
    </div>
  );
}
