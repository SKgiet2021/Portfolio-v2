import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

// --- Types ---
interface Ripple {
  x: number;
  y: number;
  age: number; // Frames alive
  active: boolean;
}

interface DigitalRainProps {
  hue?: number;
}

// --- Canvas Component ---
export const DigitalRainCanvas: React.FC<DigitalRainProps> = ({
  hue = 160,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const ripplesRef = useRef<Ripple[]>([]);
  const hueRef = useRef(hue);
  const isDarkRef = useRef(
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true
  );

  useEffect(() => {
    const updateTheme = () => {
      isDarkRef.current = document.documentElement.classList.contains("dark");
    };

    // Initial check
    updateTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          updateTheme();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  // Update ref when prop changes to avoid re-binding the loop
  useEffect(() => {
    hueRef.current = hue;
  }, [hue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Grid configuration
    const DOT_SPACING = 30;
    const DOT_RADIUS = 1.2;
    const MAX_RIPPLE_AGE = 200;
    const SPAWN_CHANCE = 0.05; // 5% chance per frame

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", resize);
    resize();

    const animate = () => {
      // 1. Fade / Clear background
      // Dark mode: Dark slate (#0f172a), Light mode: White (#ffffff)
      ctx.fillStyle = isDarkRef.current ? "#0f172a" : "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // 2. Manage Ripples
      // Spawn new ripple
      if (Math.random() < SPAWN_CHANCE) {
        ripplesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          age: 0,
          active: true,
        });
      }

      // Update ripples
      ripplesRef.current.forEach((r) => {
        r.age += 1;
        if (r.age > MAX_RIPPLE_AGE) r.active = false;
      });
      // Cleanup dead ripples
      ripplesRef.current = ripplesRef.current.filter((r) => r.active);

      // 3. Draw Grid
      const cols = Math.ceil(width / DOT_SPACING);
      const rows = Math.ceil(height / DOT_SPACING);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * DOT_SPACING;
          const y = j * DOT_SPACING;

          // Calculate influence from ripples
          let totalInfluence = 0;

          ripplesRef.current.forEach((ripple) => {
            const dx = x - ripple.x;
            const dy = y - ripple.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Ripple radius based on age
            const currentRadius = ripple.age * 2; // Expansion speed
            const distanceDiff = Math.abs(dist - currentRadius);

            // If the dot is near the ripple wavefront
            if (distanceDiff < 50) {
              // Sine wave intensity
              const wave = Math.sin(distanceDiff * 0.1);
              // Only positive influence and fade out with distance/age
              if (wave > 0) {
                const intensity =
                  (1 - distanceDiff / 50) * (1 - ripple.age / MAX_RIPPLE_AGE);
                totalInfluence += intensity;
              }
            }
          });

          // Base state
          let radius = DOT_RADIUS;
          let opacity = isDarkRef.current ? 0.2 : 0.1; // Slightly more transparent in light mode
          // In light mode, use a darker base color for visibility if needed, or keep hue
          let lightness = isDarkRef.current ? 50 : 40; // Darker dots in light mode
          let color = `hsla(${hueRef.current}, 70%, ${lightness}%, ${opacity})`;

          // Active state (hit by ripple)
          if (totalInfluence > 0.1) {
            const boost = Math.min(totalInfluence, 1);
            radius = DOT_RADIUS + boost * 2; // Grow up to +2px
            opacity = 0.2 + boost * 0.8; // Fade up to 1.0

            // Shift lightness for sparkle
            // Dark mode: brighter (50 -> 90), Light mode: darker (40 -> 20) or keep bright?
            // Let's keep it bright for "sparkle" effect even in light mode, or maybe darker?
            // Actually, bright sparkles on white look okay if they are colorful.
            const activeLightness = isDarkRef.current
              ? 50 + boost * 40
              : 40 + boost * 20;
            color = `hsla(${hueRef.current}, 80%, ${activeLightness}%, ${opacity})`;
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []); // Empty deps, we use refs for mutable state

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
    />
  );
};

// --- Demo / Wrapper Component ---
export const DigitalRainDemo = () => {
  const [hue, setHue] = useState(160); // Default Cyan-ish

  const presets = [
    { name: "Cyan", value: 180, color: "bg-cyan-500" },
    { name: "Lime", value: 120, color: "bg-lime-500" },
    { name: "Gold", value: 45, color: "bg-yellow-500" },
    { name: "Purple", value: 270, color: "bg-purple-500" },
    { name: "Rose", value: 340, color: "bg-rose-500" },
  ];

  return (
    <div className="relative w-full h-screen bg-[#0f172a] overflow-hidden font-sans">
      {/* Background */}
      <DigitalRainCanvas hue={hue} />

      {/* UI Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl pointer-events-auto max-w-md w-full mx-4"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
              <RefreshCw className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Digital Rain</h2>
              <p className="text-slate-400 text-sm">
                Interactive Background Effect
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Hue Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-300">Color Hue</span>
                <span className="text-slate-500">{hue}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={(e) => setHue(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div
                className="h-2 w-full rounded-full mt-2 opacity-50"
                style={{
                  background: `linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)`,
                }}
              />
            </div>

            {/* Presets */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-slate-300">
                Presets
              </span>
              <div className="flex gap-3 flex-wrap">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setHue(preset.value)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50",
                      hue === preset.value
                        ? "border-white scale-110 shadow-lg"
                        : "border-transparent opacity-70 hover:opacity-100",
                      preset.color
                    )}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-xs text-slate-500">
              Click anywhere to see ripples (simulated automatically)
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DigitalRainDemo;
