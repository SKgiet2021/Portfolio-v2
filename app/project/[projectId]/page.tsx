"use client";

import { LavaLamp } from "@/components/ui/fluid-blob";
import { DotLoader } from "@/components/ui/dot-loader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Simple loading animation frames
const loadingFrames = [
    [14, 7, 0, 8, 6, 13, 20],
    [14, 7, 13, 20, 16, 27, 21],
    [14, 20, 27, 21, 34, 24, 28],
    [27, 21, 34, 28, 41, 32, 35],
    [34, 28, 41, 35, 48, 40, 42],
    [34, 28, 41, 35, 48, 42, 46],
    [34, 28, 41, 35, 48, 42, 38],
    [34, 28, 41, 35, 48, 30, 21],
    [34, 28, 41, 48, 21, 22, 14],
    [34, 28, 41, 21, 14, 16, 27],
    [34, 28, 21, 14, 10, 20, 27],
    [28, 21, 14, 4, 13, 20, 27],
    [28, 21, 14, 12, 6, 13, 20],
    [28, 21, 14, 6, 13, 20, 11],
    [28, 21, 14, 6, 13, 20, 10],
    [14, 6, 13, 20, 9, 7, 21],
];

export default function ProjectPage() {
    const router = useRouter();

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            {/* Lava Lamp Background */}
            <LavaLamp />

            {/* Back Button */}
            <div className="absolute top-8 left-8 z-20 mix-blend-exclusion">
                <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="bg-white/10 backdrop-blur-md border-white text-white hover:bg-white/20"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
                </Button>
            </div>

            <div className="relative flex flex-col items-center justify-center h-full px-4 text-center gap-6">
                <div className="mix-blend-exclusion pointer-events-none">
                    <DotLoader
                        frames={loadingFrames}
                        className="gap-1"
                        dotClassName="bg-white [&.active]:bg-white/50 size-2 rounded-full"
                    />
                </div>

                <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight mix-blend-exclusion whitespace-nowrap">
                    COMING SOON
                </h1>
                <p className="text-lg md:text-xl text-center text-white mix-blend-exclusion max-w-2xl leading-relaxed">
                    This project is currently under development. Stay tuned for something amazing!
                </p>
            </div>
        </div>
    );
}
