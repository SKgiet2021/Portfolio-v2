"use client"

import React, {
    useEffect,
    useState,
    type ReactNode,
    type CSSProperties,
} from "react"

export interface GlassSurfaceProps {
    children?: ReactNode
    width?: number | string
    height?: number | string
    borderRadius?: number
    borderWidth?: number
    brightness?: number
    opacity?: number
    blur?: number
    displace?: number
    backgroundOpacity?: number
    saturation?: number
    distortionScale?: number
    redOffset?: number
    greenOffset?: number
    blueOffset?: number
    xChannel?: "R" | "G" | "B"
    yChannel?: "R" | "G" | "B"
    mixBlendMode?: "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity" | "plus-darker" | "plus-lighter"
    className?: string
    style?: CSSProperties
}

const GlassSurface: React.FC<GlassSurfaceProps> = ({
    children,
    width = "auto",
    height = "auto",
    borderRadius = 20,
    borderWidth = 0.07,
    brightness = 50,
    opacity = 0.93,
    blur = 11,
    displace = 0,
    backgroundOpacity = 0,
    saturation = 1,
    distortionScale = -180,
    redOffset = 0,
    greenOffset = 10,
    blueOffset = 20,
    xChannel = "R",
    yChannel = "G",
    mixBlendMode = "difference",
    className = "",
    style = {},
}) => {
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    const containerStyles: CSSProperties = {
        ...style,
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: `${borderRadius}px`,
    }

    // Use simple fallback until mounted
    if (!mounted) {
        return (
            <div
                className={`relative flex items-center justify-center overflow-hidden bg-background/10 border border-border ${className}`}
                style={containerStyles}
            >
                <div className="w-full h-full flex items-center justify-center p-2 rounded-[inherit] relative z-10">
                    {children}
                </div>
            </div>
        )
    }

    // After mount, use enhanced glass effect
    const glassStyles: CSSProperties = {
        ...containerStyles,
        // Multi-layered glass background with gradient
        background: `linear-gradient(135deg, var(--glass-bg, rgba(255, 255, 255, 0.1)) 0%, var(--glass-bg-strong, rgba(255, 255, 255, 0.05)) 100%)`,
        // Advanced backdrop filters for realistic glass
        backdropFilter: `blur(16px) saturate(${saturation}) brightness(1.1) contrast(1.05)`,
        WebkitBackdropFilter: `blur(16px) saturate(${saturation}) brightness(1.1) contrast(1.05)`,
        // Gradient border for depth
        border: "1px solid var(--glass-border, rgba(255, 255, 255, 0.2))",
        // Multi-layered shadows for depth and realism
        boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.15),
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 var(--glass-inner-highlight, rgba(255, 255, 255, 0.2)),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1)
    `,
    }

    return (
        <div
            className={`relative flex items-center justify-center overflow-hidden transition-all duration-300 ${className}`}
            style={glassStyles}
        >
            {/* Top rim highlight */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[30%] rounded-t-[inherit]"
                style={{
                    background: "linear-gradient(to bottom, var(--glass-inner-highlight, rgba(255, 255, 255, 0.15)), transparent)",
                    mixBlendMode: "overlay",
                }}
            />

            {/* Radial glow center */}
            <div
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-40"
                style={{
                    background: "radial-gradient(circle at 50% 0%, var(--glass-inner-highlight, rgba(255, 255, 255, 0.2)), transparent 70%)",
                    mixBlendMode: "overlay",
                }}
            />

            <div className="w-full h-full flex items-center justify-center p-2 rounded-[inherit] relative z-10">
                {children}
            </div>
        </div>
    )
}

export default GlassSurface
