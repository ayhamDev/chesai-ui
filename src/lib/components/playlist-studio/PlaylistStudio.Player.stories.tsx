// src/lib/components/playlist-studio/PlaylistPlayer.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { PlaylistPlayer, PlaylistSchema } from "@chesai-ui/playlist";

const meta: Meta<typeof PlaylistPlayer> = {
  title: "PlayLists/Digital Menu Board (Playlist Player)",
  component: PlaylistPlayer,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof PlaylistPlayer>;

const PORTRAIT_SIGNAGE_SCHEMA: PlaylistSchema = {
  id: "portrait-signage-loop",
  version: "1.0",
  settings: {
    width: 1080,
    height: 1920,
    loop: true,
    backgroundColor: "#ffffff", // Standard HEX instead of semantic name
  },
  layers: [
    {
      id: "background-track",
      name: "Background",
      items: [
        {
          id: "background-music",
          type: "Audio",
          startTime: 0,
          duration: 10000,
          layout: { x: 0, y: 0, width: 0, height: 0 },
          props: {
            src: "https://cdn.pixabay.com/download/audio/2023/08/26/audio_a6ee15a317.mp3?filename=kamhunt-sunflower-street-drumloop-85bpm-163900.mp3",
            volume: 0.1,
            muted: false,
          },
        },
        {
          id: "portrait-bg-stream",
          type: "Video",
          startTime: 0,
          duration: 10000,
          layout: { x: 0, y: 0, width: "100%", height: "100%", zIndex: 1 },
          props: {
            src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            objectFit: "cover",
            muted: true,
          },
        },
      ],
    },
    {
      id: "overlays-track",
      name: "Graphic Overlays",
      items: [
        {
          id: "portrait-card-overlay",
          type: "Image",
          startTime: 500,
          duration: 9000,
          layout: {
            x: "10%",
            y: "15%",
            width: "80%",
            height: "40%",
            zIndex: 10,
            style: {
              borderRadius: "32px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              overflow: "hidden",
            },
          },
          transitions: {
            in: { type: "blur-scale", duration: 1200 },
            out: { type: "zoom-out", duration: 600 },
          },
          props: {
            src: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=800",
            objectFit: "cover",
          },
        },
        {
          id: "portrait-badge-overlay",
          type: "Image",
          startTime: 2000,
          duration: 5000,
          layout: {
            x: "25%",
            y: "60%",
            width: "50%",
            height: "10%",
            zIndex: 15,
            style: {
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
              overflow: "hidden",
            },
          },
          transitions: {
            in: { type: "flip-y", duration: 800 },
            out: { type: "slide-down-right", duration: 500 },
          },
          props: {
            src: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800",
            objectFit: "cover",
          },
        },
      ],
    },
  ],
};

const LANDSCAPE_SIGNAGE_SCHEMA: PlaylistSchema = {
  id: "landscape-signage-loop",
  version: "1.0",
  settings: {
    width: 1920,
    height: 1080,
    loop: true,
    backgroundColor: "#e0e0e0",
  },
  layers: [
    {
      id: "bg-track",
      name: "Background",
      items: [
        {
          id: "landscape-bg-video",
          type: "Video",
          startTime: 0,
          duration: 8000,
          layout: { x: 0, y: 0, width: 1920, height: 1080, zIndex: 1 },
          props: {
            src: "https://vjs.zencdn.net/v/oceans.mp4",
            objectFit: "cover",
            muted: true,
          },
        },
      ],
    },
    {
      id: "fg-track",
      name: "Graphics",
      items: [
        {
          id: "landscape-promo-card",
          type: "Image",
          startTime: 1000,
          duration: 6000,
          layout: {
            x: 288,
            y: 108,
            width: 450,
            height: 864,
            zIndex: 10,
            style: {
              borderRadius: "20px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              overflow: "hidden",
              border: "3px solid rgba(255,255,255,0.25)",
            },
          },
          transitions: {
            in: { type: "zoom-in", duration: 1000 },
            out: { type: "spin-cw", duration: 700 },
          },
          props: {
            src: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800",
            objectFit: "cover",
          },
        },
      ],
    },
  ],
};

export const PortraitSignageDisplay: Story = {
  name: "Portrait Board Layout",
  render: () => (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <PlaylistPlayer
        schema={PORTRAIT_SIGNAGE_SCHEMA}
        playing={true}
        outerBackgroundColor="#111111"
      />
    </div>
  ),
};

export const LandscapeSignageDisplay: Story = {
  name: "Landscape Board Layout",
  render: () => (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <PlaylistPlayer
        schema={LANDSCAPE_SIGNAGE_SCHEMA}
        playing={true}
        outerBackgroundColor="#1a1c1e"
      />
    </div>
  ),
};
