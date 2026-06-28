// src/lib/components/playlist-studio/elements.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import type { PlaylistComponentProps } from "./types";
import { clsx } from "clsx";
import Hls from "hls.js";
import { useMotionValueEvent } from "framer-motion";
import { LoadingIndicator } from "../loadingIndicator";
import { usePreload } from "./preload-context";

// A secure whitelist of standard semantic tags allowed for layout elements.
const ALLOWED_TAGS = new Set([
  "div",
  "span",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "section",
  "article",
  "aside",
  "header",
  "footer",
  "main",
  "ul",
  "ol",
  "li",
  "a",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "pre",
  "code",
  "blockquote",
  "mark",
  "strong",
  "em",
  "i",
  "b",
]);

/**
 * Universal compatible Video Engine supporting standard MP4/WebM formats
 * alongside HLS (.m3u8) live streams. Responds instantly to timeline play/pause events.
 */
export const PlaylistVideo: React.FC<PlaylistComponentProps> = ({
  id,
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

  const hasInitialSynced = useRef(false);
  const [isBufferReady, setIsBufferReady] = useState(false);
  const stallTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSeekRef = useRef<number | null>(null);

  const preload = usePreload();

  // Register asset on mount
  useEffect(() => {
    if (preload && id) {
      preload.registerAsset(id, "Video");
    }
    return () => {
      if (preload && id) {
        preload.unregisterAsset(id);
      }
    };
  }, [id, preload]);

  // Keep asset readiness status synchronized in context
  useEffect(() => {
    if (preload && id) {
      preload.setAssetReady(id, isBufferReady, isActive);
    }
  }, [id, preload, isBufferReady, isActive]);

  // Handle source errors without freezing playhead
  useEffect(() => {
    if (loadError && preload && id) {
      preload.setAssetReady(id, true, isActive);
    }
  }, [loadError, preload, id, isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setLoadError(null);
    hasInitialSynced.current = false;
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

  // Debounced stall tracking system with Pending Seek Queue
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleReady = () => {
      if (stallTimeoutRef.current) {
        clearTimeout(stallTimeoutRef.current);
        stallTimeoutRef.current = null;
      }

      // If a newer seek target was queued while seeking, execute it now
      if (pendingSeekRef.current !== null) {
        const nextTarget = pendingSeekRef.current;
        pendingSeekRef.current = null;
        try {
          video.currentTime = nextTarget;
        } catch (e) {
          // ignore
        }
        return; // Wait for the new seek to fire seeked
      }

      if (video.readyState >= 3) {
        setIsBufferReady(true);
      }
    };

    const handleStall = () => {
      if (stallTimeoutRef.current) return;
      stallTimeoutRef.current = setTimeout(() => {
        setIsBufferReady(false);
        stallTimeoutRef.current = null;
      }, 300);
    };

    video.addEventListener("canplay", handleReady);
    video.addEventListener("canplaythrough", handleReady);
    video.addEventListener("playing", handleReady);
    video.addEventListener("progress", handleReady);
    video.addEventListener("seeked", handleReady);

    video.addEventListener("waiting", handleStall);
    video.addEventListener("stalled", handleStall);
    video.addEventListener("seeking", handleStall);
    video.addEventListener("loadstart", handleStall);
    video.addEventListener("emptied", handleStall);

    handleReady();

    return () => {
      if (stallTimeoutRef.current) {
        clearTimeout(stallTimeoutRef.current);
      }
      video.removeEventListener("canplay", handleReady);
      video.removeEventListener("canplaythrough", handleReady);
      video.removeEventListener("playing", handleReady);
      video.removeEventListener("progress", handleReady);
      video.removeEventListener("seeked", handleReady);

      video.removeEventListener("waiting", handleStall);
      video.removeEventListener("stalled", handleStall);
      video.removeEventListener("seeking", handleStall);
      video.removeEventListener("loadstart", handleStall);
      video.removeEventListener("emptied", handleStall);
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || loadError) return;

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

  // --- HARDWARE-SAFE TIME SYNCHRONIZATION WITH DRIFT CORRECTION ---
  const lastPlayheadRef = useRef(0);

  useMotionValueEvent(playhead, "change", (latest) => {
    const video = videoRef.current;
    if (!video || !isActive || video.readyState < 1) {
      lastPlayheadRef.current = latest;
      return;
    }

    const expectedTimeS = Math.max(0, (latest - startTime) / 1000);
    const playheadDelta = Math.abs(latest - lastPlayheadRef.current);

    // Support relative looped seeks if schema duration is larger than the file content
    let targetTimeS = expectedTimeS;
    if (video.duration && !isNaN(video.duration) && video.duration > 0) {
      targetTimeS = expectedTimeS % video.duration;
    }

    const timeDiff = Math.abs(video.currentTime - targetTimeS);

    const triggerSeek = (seekTimeS: number) => {
      if (video.seeking) {
        pendingSeekRef.current = seekTimeS;
      } else {
        pendingSeekRef.current = null;
        try {
          video.currentTime = seekTimeS;
        } catch (e) {
          // ignore
        }
      }
    };

    if (!isTimelinePlaying) {
      // 1. Paused scrubbing: sync immediately on 100ms tolerance drift
      if (timeDiff > 0.1) {
        triggerSeek(targetTimeS);
      }
    } else {
      // 2. Active playback:
      const didPlayheadJump =
        playheadDelta > 1000 || latest < lastPlayheadRef.current;

      // Correct clock alignment if playhead loops OR drift exceeds lipsync limit (250ms)
      if (didPlayheadJump || timeDiff > 0.25) {
        triggerSeek(targetTimeS);
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
 * Invisible Programmatic Audio Engine.
 * Handled via a direct in-memory HTMLAudioElement instance.
 * Completely eliminates layout-rendering thread blocks, keeping media pipelines open.
 */
export const PlaylistAudio: React.FC<PlaylistComponentProps> = ({
  id,
  data,
  isActive,
  isTimelinePlaying,
  playhead,
  startTime,
  isSeeking = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingSeekRef = useRef<number | null>(null);

  const { src, muted = false, volume = 1 } = data;
  const preload = usePreload();

  // 1. Initialize persistent programmatic Audio object in memory
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      audioRef.current = null;
    };
  }, []);

  // 2. Register background audio asset as non-blocking to prevent master timeline deadlocks
  useEffect(() => {
    if (preload && id) {
      preload.registerAsset(id, "Audio");
      preload.setAssetReady(id, true, isActive);
    }
    return () => {
      if (preload && id) {
        preload.unregisterAsset(id);
      }
    };
  }, [id, preload, isActive]);

  // 3. Keep media sources cleanly in sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    audio.src = src;
    audio.load(); // Force immediate connection handshake and fetch metadata
  }, [src]);

  // 4. Manage playback operations with promise-backed handling
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Pause audio during active seeks to eliminate stutter and pipeline errors
    const shouldPlay = isActive && isTimelinePlaying && !isSeeking;

    if (shouldPlay) {
      audio.muted = muted;
      audio.volume = volume;

      audio
        .play()
        .then(() => {
          console.log("[PlaylistAudio] Playback started successfully!");
        })
        .catch((error) => {
          console.warn("[PlaylistAudio] Playback blocked:", error);
        });
    } else {
      audio.pause();
      if (!isActive) {
        audio.currentTime = 0;
      }
    }
  }, [isActive, isTimelinePlaying, muted, volume, isSeeking]);

  // 5. Safely handle seek completion updates sequentially
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleSeeked = () => {
      if (pendingSeekRef.current !== null) {
        const nextTarget = pendingSeekRef.current;
        pendingSeekRef.current = null;
        try {
          audio.currentTime = nextTarget;
        } catch (e) {
          console.log(e);

          // ignore
        }
      }
    };

    audio.addEventListener("seeked", handleSeeked);
    return () => {
      audio.removeEventListener("seeked", handleSeeked);
    };
  }, [src]);

  // 6. Force-align playback position as soon as seeking ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isSeeking) return;

    const currentPlayhead = playhead.get();
    const expectedTimeS = Math.max(0, (currentPlayhead - startTime) / 1000);
    let targetTimeS = expectedTimeS;
    if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
      targetTimeS = expectedTimeS % audio.duration;
    }
    try {
      audio.currentTime = targetTimeS;
    } catch (e) {
      // ignore
    }
  }, [isSeeking, isActive, startTime, playhead]);

  // 7. Drift-correction and seek alignment clock loop
  const lastPlayheadRef = useRef(0);

  useMotionValueEvent(playhead, "change", (latest) => {
    const audio = audioRef.current;
    // Skip real-time seek logic entirely while seeking is active to avoid lockups
    if (!audio || !isActive || audio.readyState < 1 || isSeeking) {
      lastPlayheadRef.current = latest;
      return;
    }

    const expectedTimeS = Math.max(0, (latest - startTime) / 1000);
    const playheadDelta = Math.abs(latest - lastPlayheadRef.current);

    // Support relative looped seeks if schema duration is larger than physical file content
    let targetTimeS = expectedTimeS;
    if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
      targetTimeS = expectedTimeS % audio.duration;
    }

    const timeDiff = Math.abs(audio.currentTime - targetTimeS);

    const triggerSeek = (seekTimeS: number) => {
      if (audio.seeking) {
        // Enqueue target to apply sequentially when current seek is finalized
        pendingSeekRef.current = seekTimeS;
      } else {
        pendingSeekRef.current = null;
        try {
          audio.currentTime = seekTimeS;
        } catch (e) {
          // ignore
        }
      }
    };

    if (!isTimelinePlaying) {
      // 1. Paused scrubbing: sync immediately on 100ms tolerance drift
      if (timeDiff > 0.1) {
        triggerSeek(targetTimeS);
      }
    } else {
      // 2. Active playback:
      const didPlayheadJump =
        playheadDelta > 1000 || latest < lastPlayheadRef.current;

      // Correct clock alignment if playhead loops OR drift exceeds lipsync limit (250ms)
      if (didPlayheadJump || timeDiff > 0.25) {
        triggerSeek(targetTimeS);
      }
    }

    lastPlayheadRef.current = latest;
  });

  // No DOM nodes are rendered for background audio streams
  return null;
};

export const PlaylistImage: React.FC<PlaylistComponentProps> = ({
  id,
  data,
  isActive,
}) => {
  const { src, alt, objectFit = "cover" } = data;
  const preload = usePreload();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (preload && id) {
      preload.registerAsset(id, "Image");
    }
    return () => {
      if (preload && id) {
        preload.unregisterAsset(id);
      }
    };
  }, [id, preload]);

  useEffect(() => {
    if (preload && id) {
      preload.setAssetReady(id, isLoaded, isActive);
    }
  }, [id, preload, isLoaded, isActive]);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setIsLoaded(true); // Unblock player
  };

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt || "Playlist Image"}
      onLoad={handleLoad}
      onError={handleError}
      className="w-full h-full border-0 block select-none pointer-events-none"
      style={{ objectFit: objectFit as React.CSSProperties["objectFit"] }}
    />
  );
};

/**
 * Flexible HTML Element Renderer.
 * Supports rendering custom tags (whitelisted for safety), custom React children,
 * or raw HTML safely integrated with transitions and coordinates.
 */
export const PlaylistHtml: React.FC<PlaylistComponentProps> = ({
  id,
  data,
  isActive,
}) => {
  const preload = usePreload();
  const { tag = "div", html, children, className, style, ...restProps } = data;

  // Sync state with preloading tracker. Plain HTML is instantly ready on mount.
  useEffect(() => {
    if (preload && id) {
      preload.registerAsset(id, "Html");
      preload.setAssetReady(id, true, isActive);
    }
    return () => {
      if (preload && id) {
        preload.unregisterAsset(id);
      }
    };
  }, [id, preload, isActive]);

  // Resolve secure tag matching whitelist
  const requestedTag = typeof tag === "string" ? tag.toLowerCase() : "div";
  const TagName = (
    ALLOWED_TAGS.has(requestedTag) ? requestedTag : "div"
  ) as React.ElementType;

  // Safely inject parsed markup if specifically passed as a string
  if (html && typeof html === "string") {
    return (
      <TagName
        className={clsx("w-full h-full overflow-hidden", className)}
        style={style}
        dangerouslySetInnerHTML={{ __html: html }}
        {...restProps}
      />
    );
  }

  return (
    <TagName
      className={clsx("w-full h-full overflow-hidden", className)}
      style={style}
      {...restProps}
    >
      {children}
    </TagName>
  );
};

export const defaultPlaylistRegistry = {
  Video: PlaylistVideo,
  Audio: PlaylistAudio,
  Image: PlaylistImage,
  Html: PlaylistHtml,
};
