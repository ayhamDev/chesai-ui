import type { Meta, StoryObj } from "@storybook/react";
import {
  Bell,
  Camera,
  Heart,
  Mic,
  Phone,
  Plus,
  Send,
  Share2,
  ThumbsUp,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  ShapedBadge,
  ShapedButton,
  ShapedIcon,
  ShapedIconButton,
} from "./shaped-components";
import { Typography } from "../typography";

const meta: Meta = {
  title: "Components/Media/Shaped Components",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const Icons: StoryObj = {
  name: "1. Shaped Icons",
  render: () => (
    <div className="flex gap-4 items-center text-graphite-primary">
      <ShapedIcon shape="flower" size={48} />
      <ShapedIcon shape="burst" size={48} />
      <ShapedIcon shape="sunny" size={48} className="text-yellow-500" />
      <ShapedIcon shape="heart" size={48} className="text-red-500" />
    </div>
  ),
};

export const IconButtons: StoryObj = {
  name: "2. Shaped Icon Buttons",
  render: () => {
    const [activeShape, setActiveShape] = useState<any>("circle");

    return (
      <div className="flex flex-col gap-8 items-center">
        <div className="flex gap-6">
          <ShapedIconButton
            shape="circle"
            variant="secondary"
            onClick={() => setActiveShape("circle")}
          >
            <Camera />
          </ShapedIconButton>

          <ShapedIconButton
            shape="flower"
            variant="primary"
            onClick={() => setActiveShape("flower")}
          >
            <Mic />
          </ShapedIconButton>

          <ShapedIconButton
            shape="sunny"
            variant="destructive"
            onClick={() => setActiveShape("sunny")}
          >
            <X />
          </ShapedIconButton>
        </div>

        <div className="flex gap-6">
          <ShapedIconButton shape="puffy" variant="secondary" size="lg">
            <ThumbsUp className="w-8 h-8" />
          </ShapedIconButton>
          {/* Morphing Example */}
          <ShapedIconButton
            shape={activeShape}
            variant="primary"
            size="lg"
            className="transition-all"
          >
            <Heart className="w-8 h-8 fill-white" />
          </ShapedIconButton>
        </div>
        <Typography variant="muted">
          Click the top buttons to morph the heart button below.
        </Typography>
      </div>
    );
  },
};

export const Badges: StoryObj = {
  name: "3. Shaped Badges",
  render: () => (
    <div className="flex gap-8 items-center">
      <div className="relative">
        <Bell className="w-8 h-8 text-graphite-foreground" />
        <div className="absolute -top-1 -right-2">
          <ShapedBadge shape="burst" variant="destructive" size="sm">
            3
          </ShapedBadge>
        </div>
      </div>

      <ShapedBadge shape="flower" variant="primary" size="md">
        New
      </ShapedBadge>

      <ShapedBadge shape="hexagon" variant="secondary" size="lg">
        #1
      </ShapedBadge>
    </div>
  ),
};

export const FloatingActionButtons: StoryObj = {
  name: "4. Expressive FABs",
  render: () => (
    <div className="flex gap-6 items-end">
      <div className="flex flex-col items-center gap-2">
        <ShapedButton shape="square" variant="secondary" size="md">
          <Plus />
        </ShapedButton>
        <Typography variant="small">Square</Typography>
      </div>

      <div className="flex flex-col items-center gap-2">
        <ShapedButton
          shape="cookie4" // "Squircle-ish"
          variant="primary"
          size="lg"
          className="shadow-xl"
        >
          <Send className="w-6 h-6 ml-1" />
        </ShapedButton>
        <Typography variant="small">Cookie</Typography>
      </div>

      <div className="flex flex-col items-center gap-2">
        <ShapedButton
          shape="pentagon"
          variant="secondary"
          size="md"
          className="bg-green-100 text-green-700" // Custom colors via className
        >
          <Phone />
        </ShapedButton>
        <Typography variant="small">Pentagon</Typography>
      </div>
    </div>
  ),
};

export const InteractiveMorph: StoryObj = {
  name: "5. Interactive Morph",
  render: () => {
    const [isLiked, setIsLiked] = useState(false);

    return (
      <ShapedButton
        shape={isLiked ? "heart" : "circle"}
        variant={isLiked ? "destructive" : "secondary"}
        size="lg"
        onClick={() => setIsLiked(!isLiked)}
        className="text-2xl"
      >
        <Heart className={isLiked ? "fill-white" : ""} />
      </ShapedButton>
    );
  },
};

export const FixedShadows: StoryObj = {
  name: "Correct Shadow Handling",
  render: () => (
    <div className="flex gap-10 items-end p-8 bg-gray-50 rounded-xl">
      {/* Square / Squircle */}
      <div className="flex flex-col items-center gap-3">
        <ShapedButton
          shape="square"
          variant="secondary"
          size="lg"
          shadow="lg" // Uses drop-shadow-lg
        >
          <Plus className="w-6 h-6" />
        </ShapedButton>
        <Typography variant="small">Square</Typography>
      </div>

      {/* Cookie / Wavy - The shadow will curve with the shape */}
      <div className="flex flex-col items-center gap-3">
        <ShapedButton
          shape="cookie4"
          variant="primary" // Black fill
          size="lg"
          shadow="xl" // Uses drop-shadow-xl
        >
          <Send className="w-6 h-6 ml-1" />
        </ShapedButton>
        <Typography variant="small">Cookie</Typography>
      </div>

      {/* Pentagon - Shadow will have 5 points */}
      <div className="flex flex-col items-center gap-3">
        <ShapedButton
          shape="pentagon"
          // Custom color via class, NO background color on container
          className="text-green-600"
          variant="ghost" // Use ghost base to allow custom text-color fill
          size="lg"
          shadow="md"
        >
          <Phone className="w-6 h-6 text-white" />
        </ShapedButton>
        <Typography variant="small">Pentagon</Typography>
      </div>
    </div>
  ),
};
