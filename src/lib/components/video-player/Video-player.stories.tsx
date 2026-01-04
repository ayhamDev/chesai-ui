import type { Meta, StoryObj } from "@storybook/react";
import { VideoPlayer } from "./index";

const meta: Meta<typeof VideoPlayer> = {
  title: "Components/Media/VideoPlayer",
  component: VideoPlayer,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A fully featured video player supporting HLS streaming, MP4/WebM formats, YouTube-like gestures, responsive controls, and keyboard shortcuts.",
      },
    },
  },
  argTypes: {
    src: { control: "text" },
    poster: { control: "text" },
    autoPlay: { control: "boolean" },
    muted: { control: "boolean" },
    loop: { control: "boolean" },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof VideoPlayer>;

// Example HLS stream (Big Buck Bunny)
const HLS_SOURCE = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
const MP4_SOURCE =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const POSTER =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg";

export const Default: Story = {
  name: "1. Default (MP4)",
  args: {
    src: MP4_SOURCE,
    poster: POSTER,
    shape: "minimal",
    title: "Big Buck Bunny - MP4",
  },
  render: (args) => (
    <div className="max-w-3xl">
      <VideoPlayer {...args} />
    </div>
  ),
};

export const HLSStreaming: Story = {
  name: "2. HLS Streaming (.m3u8)",
  args: {
    src: "http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8",
    poster: POSTER,
    shape: "minimal",
    title: "Big Buck Bunny - HLS Stream",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Supports HTTP Live Streaming (HLS) out of the box using `hls.js`. Will fallback to native HLS on Safari.",
      },
    },
  },
  render: (args) => (
    <div className="max-w-3xl">
      <VideoPlayer {...args} />
    </div>
  ),
};

export const AutoPlayMuted: Story = {
  name: "3. AutoPlay & Muted",
  args: {
    src: MP4_SOURCE,
    autoPlay: true,
    muted: true,
    loop: true,
    shape: "full",
    title: "Background Video",
  },
  render: (args) => (
    <div className="max-w-xl">
      <VideoPlayer {...args} />
    </div>
  ),
};

export const SharpShape: Story = {
  name: "4. Sharp Corners",
  args: {
    src: MP4_SOURCE,
    shape: "sharp",
    title: "Industrial Style",
  },
  render: (args) => (
    <div className="max-w-3xl">
      <VideoPlayer {...args} />
    </div>
  ),
};
