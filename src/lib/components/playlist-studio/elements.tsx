// src/lib/components/playlist-studio/elements.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import type { PlaylistComponentProps } from "./types";
import { clsx } from "clsx";
import Hls from "hls.js";
import { useMotionValueEvent } from "framer-motion";

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setLoadError(null);

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
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || loadError) return;

    const shouldPlay = isActive && isTimelinePlaying;

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
  }, [isActive, isTimelinePlaying, muted, volume, loadError]);

  // --- STRICT TIME SYNCHRONIZATION ---
  // Actively monitors the timeline's position. If the timeline loops (jumps back to 0)
  // or the editor scrubs, we force the video's internal clock to match instantly.
  useMotionValueEvent(playhead, "change", (latest) => {
    const video = videoRef.current;
    if (!video || !isActive || video.readyState < 1) return;

    const expectedTimeS = Math.max(0, (latest - startTime) / 1000);
    const timeDiff = Math.abs(video.currentTime - expectedTimeS);

    // If the video's actual time differs from the timeline by more than 0.3s, snap it.
    // This catches loops (diff will be ~10s) and editor scrubbing.
    if (timeDiff > 0.3) {
      try {
        video.currentTime = expectedTimeS;
      } catch (e) {
        // Suppress DOMExceptions if HLS is unseekable during a live buffering state
      }
    }
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    audio.src = src;
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const shouldPlay = isActive && isTimelinePlaying;

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
  }, [isActive, isTimelinePlaying, muted, volume]);

  // --- STRICT TIME SYNCHRONIZATION ---
  useMotionValueEvent(playhead, "change", (latest) => {
    const audio = audioRef.current;
    if (!audio || !isActive || audio.readyState < 1) return;

    const expectedTimeS = Math.max(0, (latest - startTime) / 1000);
    const timeDiff = Math.abs(audio.currentTime - expectedTimeS);

    // Snap audio to the timeline if it desyncs by more than 0.3s (e.g. on loop)
    if (timeDiff > 0.3) {
      try {
        audio.currentTime = expectedTimeS;
      } catch (e) {
        // Ignore seek errors during loading
      }
    }
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
