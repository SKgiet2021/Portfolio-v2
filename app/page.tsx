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
import { useState, useEffect } from "react";
import {
  CardPattern,
  generateRandomString,
} from "@/components/ui/evervault-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { GlowingEffect } from "@/components/ui/glowing-effect";

// Simple static hero component without animations
function SimpleHero() {
  const titles = ["beautiful", "smart", "new", "amazing", "wonderful"];

  return (
    <div className="w-full relative z-10 px-4 sm:px-6 md:px-8">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col items-center">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-blue-600 dark:text-blue-400">
                This is something
              </span>
              <div className="relative flex w-full justify-center overflow-visible md:overflow-hidden text-center pt-4 pb-4 md:pb-4 md:pt-4 mt-2 min-h-[120px]">
                <GooeyText
                  texts={titles}
                  morphTime={1}
                  cooldownTime={0.25}
                  className="font-bold"
                  textClassName="text-5xl md:text-7xl font-bold text-foreground"
                />
              </div>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center relative z-10 px-4">
              Managing a small business today is already tough. Avoid further
              complications by ditching outdated, tedious trade methods. Our
              goal is to streamline SMB trade, making it easier and faster than
              ever.
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Get in touch
            </button>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">
              View my work
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SimpleGridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  onClick?: () => void;
}

const SimpleGridItem = ({
  area,
  icon,
  title,
  description,
  onClick,
}: SimpleGridItemProps) => {
  const isMobile = useIsMobile();
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  const [randomString, setRandomString] = useState("");

  useEffect(() => {
    let str = generateRandomString(1500);
    setRandomString(str);
  }, []);

  function onMouseMove({ currentTarget, clientX, clientY }: any) {
    // Disable mouse tracking on mobile
    if (isMobile) return;

    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);

    const str = generateRandomString(1500);
    setRandomString(str);
  }

  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div
        className="relative h-full cursor-pointer group/card rounded-[1.25rem]"
        onClick={onClick}
        onMouseMove={onMouseMove}
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
};

export default function HomePage() {
  const router = useRouter();

  const navItems = [
    { name: "Home", url: "#home", icon: Home },
    { name: "About", url: "#about", icon: User },
    { name: "Skills", url: "#skills", icon: Code },
    { name: "Projects", url: "#projects", icon: Briefcase },
    { name: "Contact", url: "#contact", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background font-sans antialiased relative">
      {/* Digital Rain Background */}
      <DigitalRainCanvas />

      <NavBar items={navItems} />

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
              title="Do things the right way"
              description="Running out of copy so I'll write anything."
              onClick={() => router.push("/project/1")}
            />
            <SimpleGridItem
              area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
              icon={<Settings className="h-4 w-4" />}
              title="The best AI code editor ever."
              description="Yes, it's true. I'm not even kidding. Ask my mom if you don't believe me."
              onClick={() => router.push("/project/2")}
            />
            <SimpleGridItem
              area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
              icon={<Lock className="h-4 w-4" />}
              title="You should buy Aceternity UI Pro"
              description="It's the best money you'll ever spend"
              onClick={() => router.push("/project/3")}
            />
            <SimpleGridItem
              area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
              icon={<Sparkles className="h-4 w-4" />}
              title="This card is also built by Cursor"
              description="I'm not even kidding. Ask my mom if you don't believe me."
              onClick={() => router.push("/project/4")}
            />
            <SimpleGridItem
              area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
              icon={<Search className="h-4 w-4" />}
              title="Coming soon on Aceternity UI"
              description="I'm writing the code as I record this, no shit."
              onClick={() => router.push("/project/5")}
            />
          </ul>
        </section>

        <ContactSection />
      </main >

      {/* RAG Chatbot */}
      {/* RAG Chatbot UI */}
      <div className="fixed bottom-4 right-24 z-50">
        <MorphPanel />
      </div>
    </div >
  );
}
