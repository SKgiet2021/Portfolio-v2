"use client"

import { useEffect, useMemo, useState, useId } from "react"
import {
    Cloud,
    fetchSimpleIcons,
    ICloud,
    renderSimpleIcon,
    SimpleIcon,
} from "react-icon-cloud"

export const cloudProps: Omit<ICloud, "children"> = {
    containerProps: {
        style: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            paddingTop: 40,
        },
    },
    options: {
        reverse: true,
        depth: 1,
        wheelZoom: false,
        imageScale: 2,
        activeCursor: "default",
        tooltip: "native",
        initial: [0.1, -0.1],
        clickToFront: 500,
        tooltipDelay: 0,
        outlineColour: "#0000",
        maxSpeed: 0.04,
        minSpeed: 0.02,
    },
}

export const renderCustomIcon = (icon: SimpleIcon, theme: string) => {
    const bgHex = theme === "light" ? "#f3f2ef" : "#080510"
    const fallbackHex = theme === "light" ? "#6e6e73" : "#ffffff"
    const minContrastRatio = theme === "dark" ? 2 : 1.2

    return renderSimpleIcon({
        icon,
        bgHex,
        fallbackHex,
        minContrastRatio,
        size: 42,
        aProps: {
            href: undefined,
            target: undefined,
            rel: undefined,
            onClick: (e: any) => e.preventDefault(),
        },
    })
}

export type DynamicCloudProps = {
    iconSlugs: string[]
}

type IconData = Awaited<ReturnType<typeof fetchSimpleIcons>>

// Custom hook for manual theme system (no next-themes dependency)
function useManualTheme() {
    const [theme, setTheme] = useState<string>("light")

    useEffect(() => {
        // Check initial theme
        const isDark = document.documentElement.classList.contains("dark")
        setTheme(isDark ? "dark" : "light")

        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class") {
                    const isDark = document.documentElement.classList.contains("dark")
                    setTheme(isDark ? "dark" : "light")
                }
            })
        })

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        })

        return () => observer.disconnect()
    }, [])

    return theme
}

export function IconCloud({ iconSlugs }: DynamicCloudProps) {
    const [data, setData] = useState<IconData | null>(null)
    const [mounted, setMounted] = useState(false)
    const theme = useManualTheme()
    const canvasId = useId()

    // Prevent hydration mismatch by only rendering on client
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        fetchSimpleIcons({ slugs: iconSlugs }).then(setData)
    }, [iconSlugs])

    const renderedIcons = useMemo(() => {
        if (!data) return null

        return Object.values(data.simpleIcons).map((icon) =>
            renderCustomIcon(icon, theme || "light"),
        )
    }, [data, theme])

    // Return placeholder during SSR and before client hydration
    if (!mounted) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    paddingTop: 40,
                    minHeight: 400,
                }}
            >
                {/* Empty placeholder to prevent layout shift */}
            </div>
        )
    }

    return (
        // @ts-ignore - Cloud component from react-icon-cloud
        <Cloud
            {...cloudProps}
            id={canvasId.replace(/:/g, "-")}
            containerProps={{
                ...cloudProps.containerProps,
                id: `canvas-container-${canvasId.replace(/:/g, "-")}`,
            }}
        >
            <>{renderedIcons}</>
        </Cloud>
    )
}
