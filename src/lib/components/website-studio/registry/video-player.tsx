import React from "react";
import { VideoPlayer } from "../../video-player";
import type { RegistryComponent } from "../types";

export const VideoPlayerConfig: RegistryComponent = {
  name: "Video Player",
  category: "Media",
  render: ({ src, poster, title, autoPlay, muted, loop, shape, objectFit, ...props }) => (
    <div className="w-full" {...props}>
      <VideoPlayer
        src={src || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
        poster={poster}
        title={title}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        shape={shape}
        objectFit={objectFit}
      />
    </div>
  ),
  controls: {
    src: {
      type: "link",
      label: "Video URL (.mp4, .webm, or .m3u8)",
      group: "Source",
      defaultValue: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      supportsCMS: true,
    },
    poster: {
      type: "image",
      label: "Poster Image URL",
      group: "Source",
      supportsCMS: true,
    },
    title: {
      type: "text",
      label: "Video Title",
      group: "Source",
      defaultValue: "Sample Video",
      supportsCMS: true,
    },
    autoPlay: {
      type: "boolean",
      label: "Auto Play",
      group: "Playback",
      defaultValue: false,
    },
    muted: {
      type: "boolean",
      label: "Start Muted",
      group: "Playback",
      defaultValue: false,
    },
    loop: {
      type: "boolean",
      label: "Loop Video",
      group: "Playback",
      defaultValue: false,
    },
    shape: {
      type: "select",
      label: "Corner Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Heavy Round)", value: "full" },
        { label: "Minimal (Standard)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    objectFit: {
      type: "select",
      label: "Video Fit",
      group: "Aesthetics",
      defaultValue: "contain",
      options: [
        { label: "Contain (Letterbox)", value: "contain" },
        { label: "Cover (Crop)", value: "cover" },
        { label: "Fill (Stretch)", value: "fill" },
      ],
    },
  },
};
