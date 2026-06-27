// src/lib/components/playlist-studio/player.tsx
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { clsx } from "clsx";
import { useMotionValueEvent } from "framer-motion";
import type {
  PlaylistSchema,
  PlaylistComponentRegistry,
  PlaylistLayer,
} from "./types";
import { usePlayhead } from "./use-playhead";
import { ItemRenderer } from "./item-renderer";
import { defaultPlaylistRegistry } from "./elements";

export interface PlaylistPlayerProps {
  schema: PlaylistSchema;
  components?: PlaylistComponentRegistry;
  playing?: boolean;
  className?: string;
  onLoop?: () => void;
  outerBackgroundColor?: string;
  externalPlayhead?: any; // Framer MotionValue<number> for editor control
  onTimeUpdate?: (timeMs: number) => void; // Sync external editor UI
}

export const PlaylistPlayer: React.FC<PlaylistPlayerProps> = ({
  schema,
  components = defaultPlaylistRegistry,
  playing = true,
  className,
  onLoop,
  outerBackgroundColor = "#000000",
  externalPlayhead,
  onTimeUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const mergedComponents = { ...defaultPlaylistRegistry, ...components };
  const { settings, layers } = schema;

  // Dynamically calculate overall playlist loop duration based on tracks' maximum bounds
  const calculatedDuration = useMemo(() => {
    let maxTime = 0;
    layers.forEach((layer) => {
      layer.items.forEach((item) => {
        const endTime = item.startTime + item.duration;
        if (endTime > maxTime) {
          maxTime = endTime;
        }
      });
    });
    return maxTime || 1000; // Fallback to 1s if the layers are empty
  }, [layers]);

  const { playhead } = usePlayhead({
    duration: calculatedDuration,
    loop: settings.loop,
    playing,
    onComplete: onLoop,
    externalPlayhead,
  });

  // Emit time updates for external Editor UI without triggering React renders
  useMotionValueEvent(playhead, "change", (latest) => {
    onTimeUpdate?.(latest as number);
  });

  // Calculate layout fitting constraints
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculateScale = () => {
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;
      const schemaW = settings.width;
      const schemaH = settings.height;

      const scaleX = containerW / schemaW;
      const scaleY = containerH / schemaH;

      setScale(Math.min(scaleX, scaleY));
    };

    const resizeObserver = new ResizeObserver(calculateScale);
    resizeObserver.observe(container);

    calculateScale();
    return () => resizeObserver.disconnect();
  }, [settings.width, settings.height]);

  const mapBgToClass = (bg: string) => {
    if (bg.startsWith("bg-") || bg.startsWith("#") || bg.startsWith("rgb"))
      return bg;

    const mappings: Record<string, string> = {
      surface: "bg-surface",
      "surface-container-lowest": "bg-surface-container-lowest",
      "surface-container-low": "bg-surface-container-low",
      "surface-container": "bg-surface-container",
      "surface-container-high": "bg-surface-container-high",
      "surface-container-highest": "bg-surface-container-highest",
      background: "bg-background",
      primary: "bg-primary",
      secondary: "bg-secondary-container",
      tertiary: "bg-tertiary-container",
      error: "bg-error-container",
    };

    return mappings[bg] || "";
  };

  const bgClass = mapBgToClass(settings.backgroundColor);
  const hasHexColor =
    settings.backgroundColor.startsWith("#") ||
    settings.backgroundColor.startsWith("rgb");

  return (
    <div
      ref={containerRef}
      className={clsx(
        "relative w-full h-full flex items-center justify-center overflow-hidden transition-colors duration-200",
        className,
      )}
      style={{ backgroundColor: outerBackgroundColor }}
    >
      {/* Scaled Signage Board */}
      <div
        className={clsx(
          "relative origin-center overflow-hidden shadow-2xl transition-transform ease-out duration-100 shrink-0",
          !hasHexColor && bgClass,
        )}
        style={{
          width: settings.width,
          height: settings.height,
          transform: `scale(${scale})`,
          backgroundColor: hasHexColor ? settings.backgroundColor : undefined,
          boxSizing: "content-box",
        }}
      >
        {layers.map((layer) => (
          <div key={layer.id} className="absolute inset-0 pointer-events-none">
            {layer.items.map((item) => (
              <ItemRenderer
                key={item.id}
                item={item}
                playhead={playhead}
                components={mergedComponents}
                isTimelinePlaying={playing}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
