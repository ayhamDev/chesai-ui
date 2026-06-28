// src/lib/components/playlist-studio/player.tsx
"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { clsx } from "clsx";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { Card } from "../card";
import { Item, ItemGroup, ItemContent, ItemTitle, ItemMedia } from "../item";
import { Sheet } from "../sheet";
import { IconButton } from "../icon-button";
import { Slider } from "../slider";
import { Typography } from "../typography";
import {
  Play,
  Pause,
  Repeat,
  SkipBack,
  SkipForward,
  MonitorPlay,
} from "lucide-react";

import type { PlaylistSchema, PlaylistComponentRegistry } from "./types";
import { usePlayhead } from "./use-playhead";
import { ItemRenderer } from "./item-renderer";
import { defaultPlaylistRegistry } from "./elements";

// --- Time Formatting Helper ---
const formatTime = (ms: number) => {
  if (isNaN(ms) || ms < 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

// --- Sub-Component: HUD Overlay ---
interface HUDControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  playhead: MotionValue<number>;
  duration: number;
  onSeek: (ms: number) => void;
  onPrev: () => void;
  onNext: () => void;
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onOpenSheet: () => void;
  /** Resolution scale factor from main player viewport */
  scale: number;
}

const HUDControls: React.FC<HUDControlsProps> = ({
  isPlaying,
  onTogglePlay,
  isLooping,
  onToggleLoop,
  playhead,
  duration,
  onSeek,
  onPrev,
  onNext,
  isVisible,
  onMouseEnter,
  onMouseLeave,
  onOpenSheet,
  scale,
}) => {
  const [sliderVal, setSliderVal] = useState([0]);
  const [timeText, setTimeText] = useState("00:00");
  const isDragging = useRef(false);

  // Sync timeline progress to HUD (throttled visually via Framer)
  useMotionValueEvent(playhead, "change", (latest) => {
    const val = latest as number;
    // Format text
    setTimeText(formatTime(val));
    // Sync slider only if the user isn't actively scrubbing it
    if (!isDragging.current) {
      setSliderVal([val]);
    }
  });

  return (
    <div
      className={clsx(
        "absolute inset-0 z-50 transition-opacity duration-500 ease-out flex flex-col justify-end p-4 md:p-6",
        isVisible
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Bottom Center: Solid Playback Bar (Scaled natively from Bottom-Center Centering Origin) */}
      <div
        className="absolute bottom-6 left-1/2 w-[90%] max-w-3xl pointer-events-auto"
        style={{
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: "bottom center",
        }}
      >
        <Card
          variant="surface-container-highest"
          shape="full"
          padding="sm"
          bordered
          elevation={4}
          className="w-full flex items-center gap-2 md:gap-4 shadow-2xl"
        >
          <IconButton
            variant="ghost"
            shape="full"
            size="md"
            onClick={onTogglePlay}
          >
            {isPlaying ? (
              <Pause size={22} className="fill-current" />
            ) : (
              <Play size={22} className="fill-current ml-1" />
            )}
          </IconButton>

          <IconButton
            variant="ghost"
            shape="full"
            size="md"
            onClick={onToggleLoop}
            className={clsx(!isLooping && "opacity-40")}
          >
            <Repeat size={20} />
          </IconButton>

          {/* Solid Playlist Drawer Trigger */}
          <IconButton
            variant="ghost"
            shape="full"
            size="md"
            title="Select Playlist"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSheet();
            }}
          >
            <MonitorPlay size={20} />
          </IconButton>

          <div
            className="flex-1 flex items-center px-2 cursor-pointer"
            onPointerDown={() => {
              isDragging.current = true;
            }}
            onPointerUp={() => {
              isDragging.current = false;
              onSeek(sliderVal[0]);
            }}
          >
            <Slider
              visual="line"
              shape="full"
              color="primary"
              min={0}
              max={Math.max(duration, 1)}
              value={sliderVal}
              onValueChange={(v) => {
                setSliderVal(v);
                // Real-time scrubbing video while dragging
                if (isDragging.current) onSeek(v[0]);
              }}
            />
          </div>

          <Typography
            variant="label-medium"
            className="tabular-nums opacity-80 whitespace-nowrap min-w-[90px] text-center text-sm"
          >
            {timeText} / {formatTime(duration)}
          </Typography>

          <div className="flex items-center gap-1">
            <IconButton variant="ghost" shape="full" size="md" onClick={onPrev}>
              <SkipBack size={20} className="fill-current" />
            </IconButton>
            <IconButton variant="ghost" shape="full" size="md" onClick={onNext}>
              <SkipForward size={20} className="fill-current" />
            </IconButton>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- CORE PLAYBACK ENGINE (Resets entirely on unique key trigger) ---
interface PlaylistPlayerCoreProps {
  activeSchema: PlaylistSchema;
  components: PlaylistComponentRegistry;
  playing: boolean;
  showControls: boolean;
  onLoop?: () => void;
  externalPlayhead?: any;
  onTimeUpdate?: (timeMs: number) => void;
  onOpenSheet: () => void;
  isHUDLocked: boolean;
  setIsHUDLocked: (locked: boolean) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const PlaylistPlayerCore: React.FC<PlaylistPlayerCoreProps> = ({
  activeSchema,
  components,
  playing,
  showControls,
  onLoop,
  externalPlayhead,
  onTimeUpdate,
  onOpenSheet,
  isHUDLocked,
  setIsHUDLocked,
  onPrev,
  onNext,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Local Playback States (Wiped and recreated cleanly per schema)
  const [isPlaying, setIsPlaying] = useState(playing);
  const [isLooping, setIsLooping] = useState(
    activeSchema.settings.loop ?? true,
  );

  // Keep internal playing state synced with parent props
  useEffect(() => {
    setIsPlaying(playing);
  }, [playing]);

  const calculatedDuration = useMemo(() => {
    let maxTime = 0;
    activeSchema.layers.forEach((layer) => {
      layer.items.forEach((item) => {
        const endTime = item.startTime + item.duration;
        if (endTime > maxTime) maxTime = endTime;
      });
    });
    return maxTime || 1000;
  }, [activeSchema]);

  const { playhead, seek } = usePlayhead({
    duration: calculatedDuration,
    loop: isLooping,
    playing: isPlaying,
    onComplete: () => {
      onLoop?.();
    },
    externalPlayhead,
  });

  // Sync external UI without triggering React renders
  useMotionValueEvent(playhead, "change", (latest) => {
    onTimeUpdate?.(latest as number);
  });

  // Calculate layout fitting scale
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculateScale = () => {
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;
      const schemaW = activeSchema.settings.width;
      const schemaH = activeSchema.settings.height;

      const scaleX = containerW / schemaW;
      const scaleY = containerH / schemaH;

      setScale(Math.min(scaleX, scaleY));
    };

    const resizeObserver = new ResizeObserver(calculateScale);
    resizeObserver.observe(container);

    calculateScale();
    return () => resizeObserver.disconnect();
  }, [activeSchema]);

  // --- HUD Auto-Hide Logic ---
  const [isHUDVisible, setIsHUDVisible] = useState(false);
  const hudTimeout = useRef<NodeJS.Timeout | null>(null);

  const triggerHUD = () => {
    if (!showControls) return;
    setIsHUDVisible(true);
    if (hudTimeout.current) clearTimeout(hudTimeout.current);

    if (isPlaying && !isHUDLocked) {
      hudTimeout.current = setTimeout(() => setIsHUDVisible(false), 3000);
    }
  };

  useEffect(() => {
    if (showControls) {
      triggerHUD();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, showControls, isHUDLocked]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showControls || isHUDLocked) return;
    if (e.key === " ") {
      e.preventDefault();
      setIsPlaying((p) => !p);
      triggerHUD();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      seek(Math.min(playhead.get() + 5000, calculatedDuration));
      triggerHUD();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      seek(Math.max(playhead.get() - 5000, 0));
      triggerHUD();
    }
  };

  // Safe wrapping navigation fallback for HUD control inputs
  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    } else {
      seek(0);
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      seek(calculatedDuration);
    }
  };

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

  const bgClass = mapBgToClass(activeSchema.settings.backgroundColor);
  const hasHexColor =
    activeSchema.settings.backgroundColor.startsWith("#") ||
    activeSchema.settings.backgroundColor.startsWith("rgb");

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseMove={triggerHUD}
      onClick={triggerHUD}
    >
      {/* Interactive HUD Controls */}
      {showControls && (
        <HUDControls
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          isLooping={isLooping}
          onToggleLoop={() => setIsLooping(!isLooping)}
          playhead={playhead}
          duration={calculatedDuration}
          onSeek={seek}
          onPrev={handlePrev}
          onNext={handleNext}
          isVisible={isHUDVisible}
          onMouseEnter={() => {
            if (hudTimeout.current) clearTimeout(hudTimeout.current);
            setIsHUDVisible(true);
          }}
          onMouseLeave={() => {
            if (isPlaying && !isHUDLocked) triggerHUD();
          }}
          onOpenSheet={onOpenSheet}
          scale={scale}
        />
      )}

      {/* Scaled Signage Canvas */}
      <div
        className={clsx(
          "relative origin-center overflow-hidden shadow-2xl transition-transform ease-out duration-100 shrink-0 z-0",
          !hasHexColor && bgClass,
        )}
        style={{
          width: activeSchema.settings.width,
          height: activeSchema.settings.height,
          transform: `scale(${scale})`,
          backgroundColor: hasHexColor
            ? activeSchema.settings.backgroundColor
            : undefined,
          boxSizing: "content-box",
        }}
      >
        {activeSchema.layers.map((layer) => (
          <div key={layer.id} className="absolute inset-0 pointer-events-none">
            {layer.items.map((item) => (
              <ItemRenderer
                key={item.id}
                item={item}
                playhead={playhead}
                components={components}
                isTimelinePlaying={isPlaying}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- ORCHESTRATOR COMPONENT (Maintains persistent UI, triggers key flushes) ---
export interface PlaylistPlayerProps {
  schema?: PlaylistSchema;
  schemas?: PlaylistSchema | PlaylistSchema[];
  components?: PlaylistComponentRegistry;
  playing?: boolean;
  showControls?: boolean;
  className?: string;
  onLoop?: () => void;
  outerBackgroundColor?: string;
  externalPlayhead?: any;
  onTimeUpdate?: (timeMs: number) => void;
}

export const PlaylistPlayer: React.FC<PlaylistPlayerProps> = ({
  schema,
  schemas,
  components = defaultPlaylistRegistry,
  playing = true,
  showControls = false,
  className,
  onLoop,
  outerBackgroundColor = "#000000",
  externalPlayhead,
  onTimeUpdate,
}) => {
  // Resolve multiple schemas gracefully
  const actualSchemas = useMemo(() => {
    if (Array.isArray(schemas)) return schemas;
    if (schemas) return [schemas];
    if (schema) return [schema];
    return [];
  }, [schema, schemas]);

  const [activeIndex, setActiveIndex] = useState(0);

  // Safeguard activeIndex logic if actualSchemas updates dynamically
  useEffect(() => {
    if (activeIndex >= actualSchemas.length && actualSchemas.length > 0) {
      setActiveIndex(actualSchemas.length - 1);
    }
  }, [actualSchemas, activeIndex]);

  const activeSchema = actualSchemas[activeIndex];

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isHUDLocked, setIsHUDLocked] = useState(false);

  // Lock HUD visibility during selection menu opens
  useEffect(() => {
    setIsHUDLocked(isSheetOpen);
  }, [isSheetOpen]);

  // Playlist track transitions
  const handlePrev = useCallback(() => {
    if (actualSchemas.length > 1) {
      setActiveIndex(
        (prev) => (prev - 1 + actualSchemas.length) % actualSchemas.length,
      );
    }
  }, [actualSchemas.length]);

  const handleNext = useCallback(() => {
    if (actualSchemas.length > 1) {
      setActiveIndex((prev) => (prev + 1) % actualSchemas.length);
    }
  }, [actualSchemas.length]);

  if (!activeSchema) return null;

  return (
    <div
      className={clsx(
        "relative w-full h-full flex items-center justify-center overflow-hidden transition-colors duration-200",
        className,
      )}
      style={{ backgroundColor: outerBackgroundColor }}
    >
      {/* 
        THE FLUSH KEY: React strictly wipes and recreates the entire Core tree (including Playhead, 
        AnimationFrames, hardware video decoder decoders, and event systems) whenever index changes.
      */}
      <PlaylistPlayerCore
        key={activeSchema.id || activeIndex}
        activeSchema={activeSchema}
        components={components}
        playing={playing}
        showControls={showControls}
        onLoop={onLoop}
        externalPlayhead={externalPlayhead}
        onTimeUpdate={onTimeUpdate}
        onOpenSheet={() => setIsSheetOpen(true)}
        isHUDLocked={isHUDLocked}
        setIsHUDLocked={setIsHUDLocked}
        onPrev={actualSchemas.length > 1 ? handlePrev : undefined}
        onNext={actualSchemas.length > 1 ? handleNext : undefined}
      />

      {/* Playlist Selection Menu (Outer persistent layout, avoids scaling conflicts) */}
      {showControls && (
        <Sheet
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          variant="surface-container-highest"
          shape="minimal"
          side="right"
        >
          <Sheet.Content className="p-0 flex flex-col h-full select-none">
            <Sheet.Grabber />
            <Sheet.Header className="pb-2 border-b border-outline-variant/10 text-left">
              <Sheet.Title className="text-lg font-bold text-on-surface">
                Select Playlist
              </Sheet.Title>
              <Sheet.Description className="text-xs opacity-60">
                Choose a signage loop layout to stream.
              </Sheet.Description>
            </Sheet.Header>
            <div className="flex-1 overflow-y-auto p-4">
              <ItemGroup gap="xs" direction="vertical">
                {actualSchemas.map((s, i) => (
                  <Item
                    key={s.id || i}
                    variant={i === activeIndex ? "primary" : "ghost"}
                    shape="minimal"
                    padding="md"
                    onClick={() => {
                      setActiveIndex(i);
                      setIsSheetOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <ItemMedia
                      variant="icon"
                      shape="minimal"
                      className="size-10"
                    >
                      <MonitorPlay size={18} />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="text-sm font-extrabold truncate">
                        {s.name || s.id}
                      </ItemTitle>
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup>
            </div>
          </Sheet.Content>
        </Sheet>
      )}
    </div>
  );
};
