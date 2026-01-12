"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { useMediaQuery } from "@uidotdev/usehooks";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import Hls from "hls.js";
import {
  Captions,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Gauge,
  Languages,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture,
  Play,
  Settings,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { IconButton } from "../icon-button";
import { Typography } from "../typography";

// --- UTILS ---

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "00:00";
  const date = new Date(0);
  date.setSeconds(seconds);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }
  return `${mm}:${ss}`;
};

// --- CVA VARIANTS ---

const playerContainerVariants = cva(
  "group/video relative w-full overflow-hidden bg-black text-white select-none flex items-center justify-center",
  {
    variants: {
      shape: {
        full: "rounded-3xl",
        minimal: "rounded-xl",
        sharp: "rounded-none",
      },
      isFullscreen: {
        true: "fixed inset-0 z-[9999] h-[100dvh] w-screen rounded-none",
        false: "aspect-video",
      },
    },
    defaultVariants: {
      shape: "minimal",
      isFullscreen: false,
    },
  }
);

// --- SUB-COMPONENT: Video Scrubber ---

interface VideoScrubberProps {
  value: number;
  max: number;
  buffer: number;
  onValueChange: (val: number[]) => void;
  onValueCommit: (val: number[]) => void;
  variant?: "video" | "volume";
}

const VideoScrubber = ({
  value,
  max,
  buffer,
  onValueChange,
  onValueCommit,
  variant = "video",
}: VideoScrubberProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const rangeColor = variant === "video" ? "bg-red-600" : "bg-white";
  const thumbColor = variant === "video" ? "bg-red-600" : "bg-white";

  return (
    <SliderPrimitive.Root
      className="relative flex h-6 w-full touch-none select-none items-center group/slider cursor-pointer"
      value={[value]}
      max={max}
      step={0.1}
      onValueChange={onValueChange}
      onValueCommit={onValueCommit}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-white/20 transition-all duration-200 group-hover/slider:h-1.5">
        <div
          className="absolute h-full bg-white/40 transition-all duration-200"
          style={{ width: `${max > 0 ? (buffer / max) * 100 : 0}%` }}
        />
        <SliderPrimitive.Range
          className={clsx("absolute h-full", rangeColor)}
        />
      </SliderPrimitive.Track>

      <SliderPrimitive.Thumb
        className={clsx(
          "block h-3.5 w-3.5 rounded-full shadow-lg ring-0 transition-transform duration-200 focus-visible:outline-none",
          thumbColor,
          isHovered ? "scale-125" : "scale-100"
        )}
      />
    </SliderPrimitive.Root>
  );
};

// --- TYPES FOR MENU ---
type SettingsView = "main" | "speed" | "quality" | "audio" | "captions";
interface TrackOption {
  id: number;
  label: string;
}

// --- SUB-COMPONENT: Settings Menu (Memoized) ---
// Extracted to prevent re-renders on video timeupdate

interface VideoSettingsMenuProps {
  view: SettingsView;
  onViewChange: (view: SettingsView) => void;
  playbackRate: number;
  onSpeedChange: (rate: number) => void;
  qualities: TrackOption[];
  currentQuality: number;
  onQualityChange: (id: number) => void;
  audioTracks: TrackOption[];
  currentAudioTrack: number;
  onAudioChange: (id: number) => void;
  subtitles: TrackOption[];
  currentSubtitle: number;
  onSubtitleChange: (id: number) => void;
}

const VideoSettingsMenu = React.memo(
  ({
    view,
    onViewChange,
    playbackRate,
    onSpeedChange,
    qualities,
    currentQuality,
    onQualityChange,
    audioTracks,
    currentAudioTrack,
    onAudioChange,
    subtitles,
    currentSubtitle,
    onSubtitleChange,
  }: VideoSettingsMenuProps) => {
    const menuClass =
      "absolute bottom-full right-0 mb-3 w-64 max-h-80 overflow-hidden overflow-y-auto rounded-xl bg-graphite-card border border-graphite-border p-1 shadow-xl flex flex-col gap-1 z-50 scrollbar-thin";

    const SettingsHeader = ({
      title,
      onBack,
    }: {
      title: string;
      onBack: () => void;
    }) => (
      <div className="flex items-center gap-2 px-2 py-1.5 mb-1 border-b border-graphite-border text-graphite-foreground">
        <button
          onClick={onBack}
          className="p-1 hover:bg-graphite-secondary rounded-md transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold">{title}</span>
      </div>
    );

    const MenuItem = ({
      label,
      valueLabel,
      onClick,
      isActive = false,
      icon: Icon,
      hasSubmenu = false,
    }: any) => (
      <button
        onClick={onClick}
        className={clsx(
          "relative flex w-full cursor-pointer select-none items-center justify-between rounded-md px-3 py-2 text-sm outline-none transition-colors",
          isActive
            ? "bg-graphite-secondary text-graphite-foreground font-medium"
            : "text-graphite-foreground/80 hover:bg-graphite-secondary/50 hover:text-graphite-foreground"
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={16} className="opacity-70" />}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-1 text-xs opacity-70">
          {valueLabel}
          {hasSubmenu && <ChevronRight size={14} />}
          {isActive && !hasSubmenu && (
            <Check size={14} className="text-graphite-primary" />
          )}
        </div>
      </button>
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className={menuClass}
        onClick={(e) => e.stopPropagation()}
      >
        {view === "main" && (
          <>
            <MenuItem
              label="Speed"
              valueLabel={playbackRate === 1 ? "Normal" : `${playbackRate}x`}
              icon={Gauge}
              hasSubmenu
              onClick={() => onViewChange("speed")}
            />
            {qualities.length > 0 && (
              <MenuItem
                label="Quality"
                valueLabel={
                  currentQuality === -1
                    ? "Auto"
                    : qualities.find((q) => q.id === currentQuality)?.label
                }
                icon={Settings}
                hasSubmenu
                onClick={() => onViewChange("quality")}
              />
            )}
            {audioTracks.length > 0 && (
              <MenuItem
                label="Audio"
                valueLabel={
                  audioTracks.find((t) => t.id === currentAudioTrack)?.label ||
                  "Default"
                }
                icon={Languages}
                hasSubmenu
                onClick={() => onViewChange("audio")}
              />
            )}
            <MenuItem
              label="Captions"
              valueLabel={
                currentSubtitle === -1
                  ? "Off"
                  : subtitles.find((t) => t.id === currentSubtitle)?.label ||
                    "Unknown"
              }
              icon={Captions}
              hasSubmenu
              onClick={() => onViewChange("captions")}
            />
          </>
        )}

        {view === "speed" && (
          <>
            <SettingsHeader
              title="Playback Speed"
              onBack={() => onViewChange("main")}
            />
            {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
              <MenuItem
                key={rate}
                label={rate === 1 ? "Normal" : `${rate}x`}
                isActive={playbackRate === rate}
                onClick={() => onSpeedChange(rate)}
              />
            ))}
          </>
        )}

        {view === "quality" && (
          <>
            <SettingsHeader
              title="Quality"
              onBack={() => onViewChange("main")}
            />
            <MenuItem
              label="Auto"
              isActive={currentQuality === -1}
              onClick={() => onQualityChange(-1)}
            />
            {qualities.map((q) => (
              <MenuItem
                key={q.id}
                label={q.label}
                isActive={currentQuality === q.id}
                onClick={() => onQualityChange(q.id)}
              />
            ))}
          </>
        )}

        {view === "audio" && (
          <>
            <SettingsHeader
              title="Audio Track"
              onBack={() => onViewChange("main")}
            />
            {audioTracks.map((t) => (
              <MenuItem
                key={t.id}
                label={t.label}
                isActive={currentAudioTrack === t.id}
                onClick={() => onAudioChange(t.id)}
              />
            ))}
          </>
        )}

        {view === "captions" && (
          <>
            <SettingsHeader
              title="Captions"
              onBack={() => onViewChange("main")}
            />
            <MenuItem
              label="Off"
              isActive={currentSubtitle === -1}
              onClick={() => onSubtitleChange(-1)}
            />
            {subtitles.map((t) => (
              <MenuItem
                key={t.id}
                label={t.label}
                isActive={currentSubtitle === t.id}
                onClick={() => onSubtitleChange(t.id)}
              />
            ))}
          </>
        )}
      </motion.div>
    );
  }
);
VideoSettingsMenu.displayName = "VideoSettingsMenu";

// --- MAIN COMPONENT ---

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  shape?: "full" | "minimal" | "sharp";
  title?: string;
  objectFit?: "contain" | "cover" | "fill";
}

export const VideoPlayer = React.forwardRef<HTMLDivElement, VideoPlayerProps>(
  (
    {
      src,
      poster,
      autoPlay = false,
      muted = false,
      loop = false,
      className,
      shape = "minimal",
      title,
      objectFit = "contain",
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const localContainerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    // Timers
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const doubleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const singleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTapTimeRef = useRef<number>(0);

    useImperativeHandle(ref, () => localContainerRef.current!);

    const isMobile = useMediaQuery("(pointer: coarse)");

    // Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(muted);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // Settings State
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsView, setSettingsView] = useState<SettingsView>("main");

    // Track State (HLS)
    const [qualities, setQualities] = useState<TrackOption[]>([]);
    const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
    const [audioTracks, setAudioTracks] = useState<TrackOption[]>([]);
    const [currentAudioTrack, setCurrentAudioTrack] = useState<number>(-1);
    const [subtitles, setSubtitles] = useState<TrackOption[]>([]);
    const [currentSubtitle, setCurrentSubtitle] = useState<number>(-1); // -1 = Off

    // Seek Gesture State
    const [doubleTapState, setDoubleTapState] = useState<{
      side: "left" | "right";
      amount: number;
    } | null>(null);

    // --- SETUP & EVENTS ---

    useEffect(() => {
      const handleFullscreenChange = () => {
        const isFull = !!document.fullscreenElement;
        setIsFullscreen(isFull);
        if (!isFull && window.screen?.orientation?.unlock) {
          window.screen.orientation.unlock();
        }
      };
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () =>
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
    }, []);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      setIsLoading(true);

      // Reset tracks
      setQualities([]);
      setAudioTracks([]);
      setSubtitles([]);

      if (Hls.isSupported() && src.endsWith(".m3u8")) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls({
          startLevel: -1, // Auto start
          capLevelToPlayerSize: true,
        });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          setIsLoading(false);
          if (autoPlay) video.play().catch(() => {});

          // Populate Levels (Quality)
          const levels = data.levels.map((l, i) => ({
            id: i,
            label: l.height ? `${l.height}p` : `Level ${i}`,
          }));
          setQualities(levels);
        });

        hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_, data) => {
          setAudioTracks(
            data.audioTracks.map((t, i) => ({
              id: i,
              label: t.name || t.lang || `Track ${i + 1}`,
            }))
          );
          setCurrentAudioTrack(hls.audioTrack);
        });

        hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (_, data) => {
          setSubtitles(
            data.subtitleTracks.map((t, i) => ({
              id: i,
              label: t.name || t.lang || `Sub ${i + 1}`,
            }))
          );
          setCurrentSubtitle(hls.subtitleTrack);
        });

        return () => {
          hls.destroy();
          hlsRef.current = null;
        };
      } else {
        // Native playback (MP4)
        video.src = src;
        video.addEventListener("loadedmetadata", () => {
          setIsLoading(false);
          if (autoPlay) video.play().catch(() => {});
        });
      }
    }, [src, autoPlay]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleUpdate = () => {
        setCurrentTime(video.currentTime);
        if (video.buffered.length > 0)
          setBuffered(video.buffered.end(video.buffered.length - 1));
      };
      const handleDuration = () => setDuration(video.duration);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleWaiting = () => setIsLoading(true);
      const handlePlaying = () => setIsLoading(false);

      video.addEventListener("timeupdate", handleUpdate);
      video.addEventListener("durationchange", handleDuration);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("playing", handlePlaying);

      return () => {
        video.removeEventListener("timeupdate", handleUpdate);
        video.removeEventListener("durationchange", handleDuration);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("waiting", handleWaiting);
        video.removeEventListener("playing", handlePlaying);
      };
    }, []);

    // --- ACTIONS ---

    const togglePlay = () => {
      if (!videoRef.current) return;
      if (isPlaying) {
        videoRef.current.pause();
        setShowControls(true);
        if (controlsTimeoutRef.current)
          clearTimeout(controlsTimeoutRef.current);
      } else {
        videoRef.current.play();
      }
    };

    const toggleMute = () => {
      if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    };

    const handleSeek = (time: number) => {
      if (videoRef.current && !isNaN(time)) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
    };

    const toggleFullscreen = async () => {
      if (!localContainerRef.current) return;
      if (!document.fullscreenElement) {
        try {
          if (localContainerRef.current.requestFullscreen)
            await localContainerRef.current.requestFullscreen();
          // @ts-ignore
          else if (localContainerRef.current.webkitRequestFullscreen)
            // @ts-ignore
            await localContainerRef.current?.webkitRequestFullscreen();
          else setIsFullscreen(true);

          // @ts-ignore
          if (window.screen?.orientation?.lock)
            // @ts-ignore
            await window.screen.orientation?.lock("landscape").catch(() => {});
        } catch (e) {
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        // @ts-ignore
        else if (document.webkitExitFullscreen)
          // @ts-ignore
          await document.webkitExitFullscreen();
        else setIsFullscreen(false);
      }
    };

    // --- TRACK ACTIONS (Memoized) ---

    const changeQuality = useCallback((levelId: number) => {
      if (hlsRef.current) {
        hlsRef.current.currentLevel = levelId;
        setCurrentQuality(levelId);
      }
      setSettingsView("main");
    }, []);

    const changeAudio = useCallback((trackId: number) => {
      if (hlsRef.current) {
        hlsRef.current.audioTrack = trackId;
        setCurrentAudioTrack(trackId);
      }
      setSettingsView("main");
    }, []);

    const changeSubtitle = useCallback((trackId: number) => {
      if (hlsRef.current) {
        hlsRef.current.subtitleTrack = trackId;
        setCurrentSubtitle(trackId);
      }
      setSettingsView("main");
    }, []);

    const changeSpeed = useCallback((rate: number) => {
      if (videoRef.current) {
        videoRef.current.playbackRate = rate;
        setPlaybackRate(rate);
      }
      setSettingsView("main");
    }, []);

    const handleViewChange = useCallback((view: SettingsView) => {
      setSettingsView(view);
    }, []);

    // --- CONTROLS VISIBILITY (AUTO HIDE) ---
    useEffect(() => {
      if (isPlaying && showControls && !isSettingsOpen) {
        if (controlsTimeoutRef.current)
          clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(
          () => setShowControls(false),
          3000
        );
      } else if (!isPlaying) {
        setShowControls(true);
        if (controlsTimeoutRef.current)
          clearTimeout(controlsTimeoutRef.current);
      }
    }, [isPlaying, showControls, isSettingsOpen]);

    // --- UNIFIED MOBILE TAP HANDLER ---
    const handleGestureClick = (e: React.MouseEvent) => {
      if (!isMobile) {
        if (isSettingsOpen) setIsSettingsOpen(false);
        else togglePlay();
        return;
      }

      const now = Date.now();
      const timeSinceLast = now - lastTapTimeRef.current;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const ratio = x / width;

      let side: "left" | "right" | null = null;
      if (ratio < 0.35) side = "left";
      if (ratio > 0.65) side = "right";

      if (timeSinceLast < 300 && side) {
        if (singleTapTimeoutRef.current)
          clearTimeout(singleTapTimeoutRef.current);
        handleSeekGesture(side);
        lastTapTimeRef.current = 0;
      } else {
        lastTapTimeRef.current = now;
        if (doubleTapState) return;
        singleTapTimeoutRef.current = setTimeout(() => {
          if (isSettingsOpen) {
            setIsSettingsOpen(false);
            setSettingsView("main");
          } else {
            setShowControls((prev) => !prev);
          }
        }, 300);
      }
    };

    const handleSeekGesture = (side: "left" | "right") => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (doubleTapTimeoutRef.current)
        clearTimeout(doubleTapTimeoutRef.current);

      setDoubleTapState((prev) => {
        const step = 10;
        if (prev && prev.side === side) {
          const newAmount = prev.amount + step;
          if (videoRef.current)
            handleSeek(
              videoRef.current.currentTime + (side === "left" ? -step : step)
            );
          return { side, amount: newAmount };
        }
        if (videoRef.current)
          handleSeek(
            videoRef.current.currentTime + (side === "left" ? -step : step)
          );
        return { side, amount: step };
      });

      doubleTapTimeoutRef.current = setTimeout(
        () => setDoubleTapState(null),
        650
      );
    };

    // --- RENDER ---

    return (
      <div
        ref={localContainerRef}
        className={clsx(
          playerContainerVariants({ shape, isFullscreen }),
          className
        )}
        onMouseMove={() => {
          if (!isMobile) {
            setShowControls(true);
            if (controlsTimeoutRef.current)
              clearTimeout(controlsTimeoutRef.current);
            if (isPlaying && !isSettingsOpen)
              controlsTimeoutRef.current = setTimeout(
                () => setShowControls(false),
                3000
              );
          }
        }}
        onMouseLeave={() => {
          if (!isMobile && isPlaying && !isSettingsOpen) setShowControls(false);
        }}
      >
        <video
          ref={videoRef}
          poster={poster}
          loop={loop}
          muted={muted}
          playsInline
          className={clsx(
            "max-h-full max-w-full bg-black",
            objectFit === "cover"
              ? "h-full w-full object-cover"
              : "h-full w-full object-contain"
          )}
        />

        {/* Gesture Overlay */}
        <div
          className="absolute inset-0 z-10"
          onClick={handleGestureClick}
          onDoubleClick={(e) => !isMobile && toggleFullscreen()}
        />

        {/* Loading Spinner */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 pointer-events-none"
            >
              <Loader2 className="h-12 w-12 animate-spin text-white/80" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Seek Feedback */}
        <AnimatePresence>
          {doubleTapState && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={clsx(
                "absolute inset-y-0 z-30 flex w-1/2 items-center justify-center bg-white/10 backdrop-blur-[2px] pointer-events-none",
                doubleTapState.side === "left"
                  ? "left-0 rounded-r-[50%]"
                  : "right-0 rounded-l-[50%]"
              )}
            >
              <div className="flex flex-col items-center text-white font-bold">
                {doubleTapState.side === "left" ? (
                  <ChevronsLeft className="h-10 w-10 mb-2" />
                ) : (
                  <ChevronsRight className="h-10 w-10 mb-2" />
                )}
                <span>{doubleTapState.amount} seconds</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play/Pause Button */}
        <AnimatePresence>
          {!isLoading && !doubleTapState && (
            <>
              {!isMobile && !isPlaying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
                >
                  <div className="bg-black/40 rounded-full p-4 backdrop-blur-sm">
                    <Play className="h-8 w-8 fill-white text-white ml-1" />
                  </div>
                </motion.div>
              )}

              {isMobile && showControls && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
                >
                  <div
                    className="bg-black/40 rounded-full p-5 backdrop-blur-sm pointer-events-auto cursor-pointer active:scale-95 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8 fill-white text-white" />
                    ) : (
                      <Play className="h-8 w-8 fill-white text-white ml-1" />
                    )}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Title Bar */}
        <AnimatePresence>
          {showControls && title && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4 pt-6 pointer-events-none"
            >
              <Typography variant="h4" className="text-white text-shadow-sm">
                {title}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 z-50 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pb-2 px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex w-full items-center gap-2">
                <VideoScrubber
                  value={currentTime}
                  max={duration || 100}
                  buffer={buffered}
                  onValueChange={(val) => handleSeek(val[0])}
                  onValueCommit={(val) => handleSeek(val[0])}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!isMobile && (
                    <IconButton
                      variant="secondary"
                      size="sm"
                      onClick={togglePlay}
                      className="bg-white/10 text-white hover:bg-white/20 border-none! outline-none!"
                    >
                      {isPlaying ? (
                        <Pause className="fill-white h-5 w-5" />
                      ) : (
                        <Play className="fill-white h-5 w-5" />
                      )}
                    </IconButton>
                  )}

                  <div className="group/volume flex items-center">
                    <IconButton
                      variant="secondary"
                      size="sm"
                      onClick={toggleMute}
                      className="bg-white/10 text-white hover:bg-white/20 border-none"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-5 w-5" />
                      ) : volume < 0.5 ? (
                        <Volume1 className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </IconButton>
                    {!isMobile && (
                      <div className="w-0 overflow-hidden transition-all duration-200 group-hover/volume:w-24 group-hover/volume:ml-2">
                        <VideoScrubber
                          variant="volume"
                          value={isMuted ? 0 : volume}
                          max={1}
                          buffer={0}
                          onValueChange={(v) => {
                            if (videoRef.current) {
                              videoRef.current.volume = v[0];
                              setVolume(v[0]);
                              setIsMuted(v[0] === 0);
                            }
                          }}
                          onValueCommit={() => {}}
                        />
                      </div>
                    )}
                  </div>

                  <div className="ml-2 flex items-center text-xs font-medium text-white/90 bg-white/10 px-2 py-1 rounded-md h-8">
                    <span>{formatTime(currentTime)}</span>
                    <span className="mx-1 opacity-50">/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Settings Menu */}
                  <div className="relative">
                    <IconButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setIsSettingsOpen(!isSettingsOpen);
                        setSettingsView("main");
                      }}
                      className={clsx(
                        "bg-white/10 text-white hover:bg-white/20 border-none transition-transform",
                        isSettingsOpen && "rotate-90 bg-white/30"
                      )}
                    >
                      <Settings className="h-5 w-5" />
                    </IconButton>
                    <AnimatePresence>
                      {isSettingsOpen && (
                        <VideoSettingsMenu
                          view={settingsView}
                          onViewChange={handleViewChange}
                          playbackRate={playbackRate}
                          onSpeedChange={changeSpeed}
                          qualities={qualities}
                          currentQuality={currentQuality}
                          onQualityChange={changeQuality}
                          audioTracks={audioTracks}
                          currentAudioTrack={currentAudioTrack}
                          onAudioChange={changeAudio}
                          subtitles={subtitles}
                          currentSubtitle={currentSubtitle}
                          onSubtitleChange={changeSubtitle}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {!isMobile && (
                    <IconButton
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        if (document.pictureInPictureElement)
                          await document.exitPictureInPicture();
                        else await videoRef.current?.requestPictureInPicture();
                      }}
                      className="bg-white/10 text-white hover:bg-white/20 border-none hidden sm:flex"
                    >
                      <PictureInPicture className="h-5 w-5" />
                    </IconButton>
                  )}

                  <IconButton
                    variant="secondary"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="bg-white/10 text-white hover:bg-white/20 border-none"
                  >
                    {isFullscreen ? (
                      <Minimize className="h-5 w-5" />
                    ) : (
                      <Maximize className="h-5 w-5" />
                    )}
                  </IconButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";
