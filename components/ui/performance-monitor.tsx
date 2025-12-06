import { useEffect, useState, useRef } from "react";
import { Activity } from "lucide-react";

interface PerformanceMetrics {
  fps: number;
  memory: number;
  renderTime: number;
  domNodes: number;
}

export function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: 0,
    renderTime: 0,
    domNodes: 0,
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationId = useRef<number>(0);

  useEffect(() => {
    const measurePerformance = () => {
      const now = performance.now();
      frameCount.current++;

      // Calculate FPS every second
      if (now >= lastTime.current + 1000) {
        const fps = Math.round(
          (frameCount.current * 1000) / (now - lastTime.current)
        );

        // Get memory usage (only available in Chrome)
        const memory = (performance as any).memory
          ? Math.round((performance as any).memory.usedJSHeapSize / 1048576) // Convert to MB
          : 0;

        // Get DOM node count
        const domNodes = document.getElementsByTagName("*").length;

        // Get average render time from recent entries
        const paintEntries = performance.getEntriesByType("paint");
        const renderTime =
          paintEntries.length > 0
            ? Math.round(paintEntries[paintEntries.length - 1].startTime)
            : 0;

        setMetrics({
          fps,
          memory,
          renderTime,
          domNodes,
        });

        frameCount.current = 0;
        lastTime.current = now;
      }

      animationId.current = requestAnimationFrame(measurePerformance);
    };

    if (isVisible) {
      animationId.current = requestAnimationFrame(measurePerformance);
    }

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [isVisible]);

  // Get performance rating color
  const getFpsColor = (fps: number) => {
    if (fps >= 55) return "text-green-500";
    if (fps >= 30) return "text-yellow-500";
    return "text-red-500";
  };

  const getMemoryColor = (memory: number) => {
    if (memory <= 100) return "text-green-500";
    if (memory <= 250) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white transition-all"
        title="Toggle Performance Monitor"
      >
        <Activity className="w-5 h-5" />
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white font-mono text-sm min-w-[250px]">
          <h3 className="text-xs font-bold mb-3 text-white/70 uppercase tracking-wider">
            Performance Monitor
          </h3>

          <div className="space-y-2">
            {/* FPS */}
            <div className="flex justify-between items-center">
              <span className="text-white/60">FPS:</span>
              <span className={`font-bold ${getFpsColor(metrics.fps)}`}>
                {metrics.fps}
              </span>
            </div>

            {/* Memory */}
            {metrics.memory > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-white/60">Memory:</span>
                <span className={`font-bold ${getMemoryColor(metrics.memory)}`}>
                  {metrics.memory} MB
                </span>
              </div>
            )}

            {/* DOM Nodes */}
            <div className="flex justify-between items-center">
              <span className="text-white/60">DOM Nodes:</span>
              <span className="font-bold text-blue-400">
                {metrics.domNodes}
              </span>
            </div>

            {/* Render Time */}
            <div className="flex justify-between items-center">
              <span className="text-white/60">Load Time:</span>
              <span className="font-bold text-purple-400">
                {metrics.renderTime}ms
              </span>
            </div>
          </div>

          {/* Performance Tips */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="text-xs text-white/50 space-y-1">
              {metrics.fps < 30 && (
                <p className="text-yellow-400">⚠️ Low FPS detected</p>
              )}
              {metrics.memory > 250 && (
                <p className="text-orange-400">⚠️ High memory usage</p>
              )}
              {metrics.fps >= 55 && metrics.memory <= 100 && (
                <p className="text-green-400">✓ Performance is good</p>
              )}
            </div>
          </div>

          {/* Browser Info */}
          <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/40">
            <p>Press F12 to open DevTools for detailed analysis</p>
          </div>
        </div>
      )}
    </>
  );
}
