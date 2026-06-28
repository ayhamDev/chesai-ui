// src/lib/components/playlist-studio/elements.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import type { PlaylistComponentProps } from "./types";
import { clsx } from "clsx";
import Hls from "hls.js";
import { useMotionValueEvent } from "framer-motion";
import { LoadingIndicator } from "../loadingIndicator";

/**
 * Universal compatible Video Engine supporting standard MP4/WebM formats
 * alongside HLS (.m3u8) live streams. Responds instantly to timeline play/pause events.
 */
export const PlaylistVideo: React.FC<PlaylistComponentProps> = ({
  data,
  isActive,
  isTimelinePlaying,
  playhead,
  startTime,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsInstanceRef = useRef<Hls | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { src, muted = true, objectFit = "cover", volume = 1 } = data;

  // Track if we have completed the initial load sync for this source
  const hasInitialSynced = useRef(false);

  // Monitor buffering progress before triggering playback
  const [isBufferReady, setIsBufferReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setLoadError(null);
    hasInitialSynced.current = false; // Reset sync status on src change
    setIsBufferReady(false);

    if (hlsInstanceRef.current) {
      hlsInstanceRef.current.destroy();
      hlsInstanceRef.current = null;
    }

    const isHls =
      src.includes(".m3u8") || src.includes("application/x-mpegURL");

    if (isHls) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hlsInstanceRef.current = hls;

        hls.on(Hls.Events.ERROR, (_: any, data: any) => {
          if (data.fatal) {
            console.warn(
              "[PlaylistVideo] Fatal HLS error encountered:",
              data.type,
            );
            setLoadError(`HLS stream error: ${data.details}`);
          }
        });
      } else {
        setLoadError("HLS playback is not supported in this environment");
      }
    } else {
      video.src = src;
    }

    return () => {
      // RELEASE HARDWARE DECODER PIPELINE TO PREVENT MEMORY LEAKS
      if (video) {
        video.pause();
        video.src = "";
        video.load();
      }
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
    };
  }, [src]);

  // Buffer Reservation System: Listen to frame loader updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkReadiness = () => {
      // HAVE_FUTURE_DATA (3) or HAVE_ENOUGH_DATA (4) guarantees a solid initial play buffer
      if (video.readyState >= 3) {
        setIsBufferReady(true);
      }
    };

    const handleLoadStart = () => {
      setIsBufferReady(false);
    };

    video.addEventListener("canplay", checkReadiness);
    video.addEventListener("canplaythrough", checkReadiness);
    video.addEventListener("progress", checkReadiness);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("emptied", handleLoadStart);

    checkReadiness();

    return () => {
      video.removeEventListener("canplay", checkReadiness);
      video.removeEventListener("canplaythrough", checkReadiness);
      video.removeEventListener("progress", checkReadiness);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("emptied", handleLoadStart);
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || loadError) return;

    // Only allow native playback to start if the timeline is playing AND our buffer is fully prepared
    const shouldPlay = isActive && isTimelinePlaying && isBufferReady;

    if (shouldPlay) {
      video.muted = muted;
      video.volume = volume;

      playPromiseRef.current = video.play();
      playPromiseRef.current.catch((error) => {
        console.warn("[PlaylistVideo] Play request prevented:", error);
      });
    } else {
      const haltPlayback = () => {
        video.pause();
        if (!isActive) {
          video.currentTime = 0;
        }
      };

      if (playPromiseRef.current) {
        playPromiseRef.current.then(haltPlayback).catch(haltPlayback);
      } else {
        haltPlayback();
      }
    }
  }, [isActive, isTimelinePlaying, isBufferReady, muted, volume, loadError]);

  // --- HARDWARE-SAFE TIME SYNCHRONIZATION ---
  const lastPlayheadRef = useRef(0);

  useMotionValueEvent(playhead, "change", (latest) => {
    const video = videoRef.current;
    // CRITICAL: Prevent write operations while browser is actively seeking to avoid decoder freezes
    if (!video || !isActive || video.readyState < 1 || video.seeking) {
      lastPlayheadRef.current = latest;
      return;
    }

    const expectedTimeS = Math.max(0, (latest - startTime) / 1000);
    const playheadDelta = Math.abs(latest - lastPlayheadRef.current);

    if (!isTimelinePlaying) {
      // 1. Paused scrubbing: sync continuously for responsive preview feedback
      const timeDiff = Math.abs(video.currentTime - expectedTimeS);
      if (timeDiff > 0.15) {
        video.currentTime = expectedTimeS;
      }
    } else {
      // 2. Active playback:
      // A. Initial Sync: Sync once when the video loads to catch up to the current playhead
      if (!hasInitialSynced.current && isBufferReady) {
        try {
          video.currentTime = expectedTimeS;
          hasInitialSynced.current = true;
        } catch (e) {
          // ignore
        }
      } else if (hasInitialSynced.current) {
        // B. Dynamic Jumps: Only seek if a discrete playhead jump or loop is detected
        const didPlayheadJump =
          playheadDelta > 1000 || latest < lastPlayheadRef.current;
        if (didPlayheadJump) {
          try {
            video.currentTime = expectedTimeS;
          } catch (e) {
            // ignore
          }
        }
      }
    }

    lastPlayheadRef.current = latest;
  });

  const handleMediaError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>,
  ) => {
    const error = (e.target as HTMLVideoElement).error;
    let message = "An unknown media error occurred.";
    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          message = "Video loading aborted.";
          break;
        case error.MEDIA_ERR_NETWORK:
          message = "Network error prevented video download.";
          break;
        case error.MEDIA_ERR_DECODE:
          message = "Video corrupted or decoding failed.";
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          message =
            "Failed to load: Video format or source url is not supported.";
          break;
      }
    }
    setLoadError(message);
  };

  const showLoader =
    isActive && isTimelinePlaying && !isBufferReady && !loadError;

  return (
    <div className="relative w-full h-full bg-surface-container-low flex items-center justify-center overflow-hidden">
      {loadError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-error-container/20 text-center">
          <span className="text-xs font-semibold text-error mb-1">
            Playback Error
          </span>
          <span className="text-[10px] text-on-error-container opacity-80 max-w-[80%] leading-normal">
            {loadError}
          </span>
        </div>
      )}
      {showLoader && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/15">
          <LoadingIndicator
            variant="material-morph"
            className="!w-20vw !h-20vh text-primary"
          />
        </div>
      )}
      <video
        ref={videoRef}
        onError={handleMediaError}
        className={clsx(
          "w-full h-full border-0 outline-none transition-opacity duration-300",
          loadError ? "opacity-0" : "opacity-100",
          objectFit === "contain" ? "object-contain" : "object-cover",
        )}
        preload="auto"
        muted={muted}
        playsInline
      />
    </div>
  );
};

/**
 * Invisible Audio Engine.
 * Supports standard audio formats (mp3, wav, aac) and synchronizes with timeline.
 */
export const PlaylistAudio: React.FC<PlaylistComponentProps> = ({
  data,
  isActive,
  isTimelinePlaying,
  playhead,
  startTime,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const { src, muted = false, volume = 1 } = data;
  const hasInitialSynced = useRef(false);
  const [isBufferReady, setIsBufferReady] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    audio.src = src;
    hasInitialSynced.current = false;
    setIsBufferReady(false);

    return () => {
      // Release decoder resources on unmount
      if (audio) {
        audio.pause();
        audio.src = "";
        audio.load();
      }
    };
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const checkReadiness = () => {
      if (audio.readyState >= 3) {
        setIsBufferReady(true);
      }
    };

    const handleLoadStart = () => {
      setIsBufferReady(false);
    };

    audio.addEventListener("canplay", checkReadiness);
    audio.addEventListener("canplaythrough", checkReadiness);
    audio.addEventListener("progress", checkReadiness);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("emptied", handleLoadStart);

    checkReadiness();

    return () => {
      audio.removeEventListener("canplay", checkReadiness);
      audio.removeEventListener("canplaythrough", checkReadiness);
      audio.removeEventListener("progress", checkReadiness);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("emptied", handleLoadStart);
    };
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const shouldPlay = isActive && isTimelinePlaying && isBufferReady;

    if (shouldPlay) {
      audio.muted = muted;
      audio.volume = volume;

      playPromiseRef.current = audio.play();
      playPromiseRef.current.catch((error) => {
        console.warn("[PlaylistAudio] Play request prevented:", error);
      });
    } else {
      const haltPlayback = () => {
        audio.pause();
        if (!isActive) {
          audio.currentTime = 0;
        }
      };

      if (playPromiseRef.current) {
        playPromiseRef.current.then(haltPlayback).catch(haltPlayback);
      } else {
        haltPlayback();
      }
    }
  }, [isActive, isTimelinePlaying, isBufferReady, muted, volume]);

  // --- HARDWARE-SAFE TIME SYNCHRONIZATION ---
  const lastPlayheadRef = useRef(0);

  useMotionValueEvent(playhead, "change", (latest) => {
    const audio = audioRef.current;
    if (!audio || !isActive || audio.readyState < 1 || audio.seeking) {
      lastPlayheadRef.current = latest;
      return;
    }

    const expectedTimeS = Math.max(0, (latest - startTime) / 1000);
    const playheadDelta = Math.abs(latest - lastPlayheadRef.current);

    if (!isTimelinePlaying) {
      // 1. Paused scrubbing: sync continuously for responsive preview feedback
      const timeDiff = Math.abs(audio.currentTime - expectedTimeS);
      if (timeDiff > 0.15) {
        audio.currentTime = expectedTimeS;
      }
    } else {
      // 2. Active playback:
      // A. Initial Sync
      if (!hasInitialSynced.current && isBufferReady) {
        try {
          audio.currentTime = expectedTimeS;
          hasInitialSynced.current = true;
        } catch (e) {
          // ignore
        }
      } else if (hasInitialSynced.current) {
        // B. Dynamic Jumps only
        const didPlayheadJump =
          playheadDelta > 1000 || latest < lastPlayheadRef.current;
        if (didPlayheadJump) {
          try {
            audio.currentTime = expectedTimeS;
          } catch (e) {
            // Ignore seek errors during loading
          }
        }
      }
    }

    lastPlayheadRef.current = latest;
  });

  return (
    <audio
      ref={audioRef}
      preload="auto"
      muted={muted}
      style={{ display: "none" }}
    />
  );
};

export const PlaylistImage: React.FC<PlaylistComponentProps> = ({ data }) => {
  const { src, alt, objectFit = "cover" } = data;
  return (
    <img
      src={src}
      alt={alt || "Playlist Image"}
      className="w-full h-full border-0 block select-none pointer-events-none"
      style={{ objectFit: objectFit as React.CSSProperties["objectFit"] }}
    />
  );
};

export const defaultPlaylistRegistry = {
  Video: PlaylistVideo,
  Audio: PlaylistAudio,
  Image: PlaylistImage,
};
