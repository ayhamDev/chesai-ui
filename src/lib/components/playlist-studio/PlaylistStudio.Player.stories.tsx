// src/lib/components/playlist-studio/PlaylistStudio.Player.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { PlaylistStudio } from "@chesai-ui/playlist";
import type { PlaylistSchema } from "./types";

const meta: Meta<typeof PlaylistStudio.Player> = {
  // Configured target Stories Title directory matching requirements
  title: "PlayLists/Digital Menu Board (Playlist Player)",
  component: PlaylistStudio.Player,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof PlaylistStudio.Player>;

// 1. Portrait Signage Loop Schema
const PORTRAIT_SIGNAGE_SCHEMA: PlaylistSchema = {
  id: "portrait-signage-loop",
  version: "1.0",
  settings: {
    width: 1080,
    height: 1920,
    loop: true,
    backgroundColor: "surface-container-lowest",
  },
  layers: [
    {
      id: "background-track",
      name: "Background",
      items: [
        {
          id: "portrait-bg-stream",
          type: "Video",
          startTime: 0,
          duration: 12000,
          layout: {
            x: 0,
            y: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          },
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
        // Slide 1: 3D Flip Transitions
        {
          id: "card-flip-x",
          type: "Image",
          startTime: 1000,
          duration: 3000,
          layout: {
            x: "10%",
            y: "10%",
            width: "80%",
            height: "35%",
            zIndex: 10,
            style: {
              borderRadius: "32px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              overflow: "hidden",
            },
          },
          transitions: {
            in: { type: "flip-x", duration: 1000 },
            out: { type: "fade", duration: 500 },
          },
          props: {
            src: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=800",
            objectFit: "cover",
          },
        },
        // Slide 2: Gravity Drop Bounce & Skew Transitions
        {
          id: "card-drop-skew",
          type: "Image",
          startTime: 4500,
          duration: 3500,
          layout: {
            x: "10%",
            y: "50%",
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
            in: { type: "drop-bounce", duration: 1200 },
            out: { type: "skew-slide", duration: 800 },
          },
          props: {
            src: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800",
            objectFit: "cover",
          },
        },
        // Slide 3: Spin Zoom Combinations
        {
          id: "card-spin-zoom",
          type: "Image",
          startTime: 8500,
          duration: 3000,
          layout: {
            x: "15%",
            y: "30%",
            width: "70%",
            height: "40%",
            zIndex: 10,
            style: {
              borderRadius: "50%", // Circular clip frame
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              overflow: "hidden",
            },
          },
          transitions: {
            in: { type: "spin-fade", duration: 1000 },
            out: { type: "zoom-out-fade", duration: 800 },
          },
          props: {
            src: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=800",
            objectFit: "cover",
          },
        },
      ],
    },
  ],
};

// 2. Landscape Signage Loop Schema
const LANDSCAPE_SIGNAGE_SCHEMA: PlaylistSchema = {
  id: "landscape-signage-loop",
  version: "1.0",
  settings: {
    width: 1920,
    height: 1080,
    loop: true,
    backgroundColor: "surface-container-lowest",
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
          layout: {
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
            zIndex: 1,
          },
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
          id: "landscape-promo-card-1",
          type: "Image",
          startTime: 1000,
          duration: 3000,
          layout: {
            x: 100,
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
            in: { type: "flip-y", duration: 1000 },
            out: { type: "zoom-in-fade", duration: 800 },
          },
          props: {
            src: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800",
            objectFit: "contain",
          },
        },
        {
          id: "landscape-promo-card-2",
          type: "Image",
          startTime: 4500,
          duration: 3000,
          layout: {
            x: 1370,
            y: 108,
            width: 450,
            height: 864,
            zIndex: 10,
          },
          transitions: {
            in: { type: "rotate-counterclockwise", duration: 800 },
            out: { type: "slide-fade-down", duration: 800 },
          },
          props: {
            src: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=800",
            objectFit: "cover",
          },
        },
      ],
    },
  ],
};

export const PortraitSignageDisplay: Story = {
  name: "Portrait Board Layout",
  render: () => {
    return (
      <div className="w-full h-screen relative overflow-hidden">
        <PlaylistStudio.Player
          schema={PORTRAIT_SIGNAGE_SCHEMA}
          playing={true}
          className="w-full h-full"
          outerBackgroundColor="#111111"
        />
      </div>
    );
  },
};

export const LandscapeSignageDisplay: Story = {
  name: "Landscape Board Layout",
  render: () => {
    return (
      <div className="w-full h-screen relative overflow-hidden">
        <PlaylistStudio.Player
          schema={LANDSCAPE_SIGNAGE_SCHEMA}
          playing={true}
          className="w-full h-full"
          outerBackgroundColor="#1a1c1e"
        />
      </div>
    );
  },
};
