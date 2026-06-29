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
import { LoadingIndicator } from "../loadingIndicator";
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
import { PreloadContext } from "./preload-context";

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

interface HUDControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  playhead: MotionValue<number>;
  duration: number;
  onSeek: (ms: number) => void;
  onSeekingChange: (seeking: boolean) => void;
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
  onSeekingChange,
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

  // Clamp the scale so the physical controls are always legible and easy to click
  const adjustedScale = Math.max(0.85, Math.min(1.1, scale));

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
          transform: `translateX(-50%) scale(${adjustedScale})`,
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
              onSeekingChange(true);
            }}
            onPointerUp={() => {
              isDragging.current = false;
              onSeek(sliderVal[0]);
              onSeekingChange(false);
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

  const [isSeeking, setIsSeeking] = useState(false);
  const wasPlayingRef = useRef(false);

  // Pause playlist automatically during manual seeking
  const handleSeekingChange = useCallback(
    (seeking: boolean) => {
      setIsSeeking(seeking);
      if (seeking) {
        wasPlayingRef.current = isPlaying;
        setIsPlaying(false);
      } else {
        if (wasPlayingRef.current) {
          setIsPlaying(true);
        }
      }
    },
    [isPlaying],
  );

  // Asset readiness tracking states
  const [assetsStatus, setAssetsStatus] = useState<
    Record<
      string,
      { type: "Video" | "Audio" | "Image" | "Html"; ready: boolean; isActive: boolean }
    >
  >({});

  const registerAsset = useCallback(
    (id: string, type: "Video" | "Audio" | "Image" | "Html") => {
      setAssetsStatus((prev) => {
        if (prev[id]) return prev;
        return { ...prev, [id]: { type, ready: false, isActive: false } };
      });
    },
    [],
  );

  const unregisterAsset = useCallback((id: string) => {
    setAssetsStatus((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const setAssetReady = useCallback(
    (id: string, ready: boolean, isActive: boolean) => {
      setAssetsStatus((prev) => {
        if (!prev[id]) return prev;
        if (prev[id].ready === ready && prev[id].isActive === isActive)
          return prev;
        return {
          ...prev,
          [id]: { ...prev[id], ready, isActive },
        };
      });
    },
    [],
  );

  // Block playback ONLY if an asset currently visible on-screen is not ready
  const isPlaybackBlocked = useMemo(() => {
    const statuses = Object.values(assetsStatus);
    if (statuses.length === 0) return false;
    return statuses.some((a) => a.isActive && !a.ready);
  }, [assetsStatus]);

  const preloadContextValue = useMemo(
    () => ({
      registerAsset,
      unregisterAsset,
      setAssetReady,
    }),
    [registerAsset, unregisterAsset, setAssetReady],
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

  // Pause playhead timeline progression if blocked by active asset load state
  const { playhead, seek } = usePlayhead({
    duration: calculatedDuration,
    loop: isLooping,
    playing: isPlaying && !isPlaybackBlocked,
    onComplete: () => {
      onLoop?.();
    },
    externalPlayhead,
  });

  // Sync external UI without triggering React renders
  useMotionValueEvent(playhead, "change", (latest) => {
    onTimeUpdate?.(latest as number);
  });

  // Calculate layout scale cleanly using requestAnimationFrame & contentRect to prevent reflow bottlenecks
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number | null = null;

    const calculateScale = (width: number, height: number) => {
      const schemaW = activeSchema.settings.width;
      const schemaH = activeSchema.settings.height;

      const scaleX = width / schemaW;
      const scaleY = height / schemaH;

      setScale(Math.min(scaleX, scaleY));
    };

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      // Extract bounding coordinates directly without forcing synchronous page recalculation
      const { width, height } = entry.contentRect;

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        calculateScale(width, height);
      });
    });

    resizeObserver.observe(container);

    // Initial measurement
    const rect = container.getBoundingClientRect();
    calculateScale(rect.width, rect.height);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
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
    if (!showControls || isHUDLocked || isPlaybackBlocked) return;
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

  // Only show backdrop loading screen if the user is actively trying to run the playhead
  const showLoadingOverlay = isPlaying && isPlaybackBlocked;

  return (
    <PreloadContext.Provider value={preloadContextValue}>
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseMove={triggerHUD}
        onClick={triggerHUD}
      >
        {/* Buffering/Preloading Overlay Indicator */}
        {showLoadingOverlay && (
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white select-none transition-all duration-300">
            <LoadingIndicator
              variant="material-morph"
              className="!w-16 !h-16 text-primary mb-4"
            />
            <Typography
              variant="title-medium"
              className="font-semibold text-white tracking-wide"
            >
              Preparing Playlist...
            </Typography>
            <Typography variant="body-small" className="opacity-70 mt-1">
              Buffering active media track
            </Typography>
          </div>
        )}

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
            onSeekingChange={handleSeekingChange}
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

        {/* Scaled Signage Canvas (Compensated to eliminate CSS transform fight lag) */}
        <div
          className={clsx(
            "relative origin-center overflow-hidden shadow-2xl shrink-0 z-0",
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
            <div
              key={layer.id}
              className="absolute inset-0 pointer-events-none"
            >
              {layer.items.map((item) => (
                <ItemRenderer
                  key={item.id}
                  item={item}
                  playhead={playhead}
                  components={components}
                  isTimelinePlaying={isPlaying && !isPlaybackBlocked}
                  isSeeking={isSeeking}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </PreloadContext.Provider>
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
