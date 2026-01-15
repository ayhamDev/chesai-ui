import type { Meta, StoryObj } from "@storybook/react";
import {
  Bell,
  Camera,
  Heart,
  Mic,
  Phone,
  Plus,
  Send,
  ThumbsUp,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  ShapedBadge,
  ShapedButton,
  ShapedIcon,
  ShapedIconButton,
  ShapedImage,
} from "./shaped-components";
import { SHAPE_PATHS, type ShapeType } from "./paths";
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
    <div className="flex gap-4 items-center text-primary">
      <ShapedIcon shape="flower" size={48} />
      <ShapedIcon shape="burst" size={48} />
      <ShapedIcon shape="sunny" size={48} className="text-yellow-500" />
      <ShapedIcon shape="heart" size={48} className="text-red-500" />
    </div>
  ),
};

export const Images: StoryObj = {
  name: "2. Shaped Images",
  render: () => {
    // --- Auto-cycle Logic ---
    const [currentShape, setCurrentShape] = useState<ShapeType>("cookie4");
    const shapes = Object.keys(SHAPE_PATHS) as ShapeType[];

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentShape((prev) => {
          const currentIndex = shapes.indexOf(prev);
          const nextIndex = (currentIndex + 1) % shapes.length;
          return shapes[nextIndex];
        });
      }, 2000);
      return () => clearInterval(interval);
    }, [shapes]);

    return (
      <div className="flex flex-col gap-12">
        {/* Dynamic Example */}
        <div className="flex flex-col items-center gap-4">
          <ShapedImage
            shape={currentShape}
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop"
            size={200}
            alt="Auto Cycling Shape"
            className="transition-all duration-300"
          />
          <div className="text-center">
            <Typography variant="h4">Auto Cycle</Typography>
            <Typography variant="muted" className="capitalize">
              Current: {currentShape}
            </Typography>
          </div>
        </div>

        {/* Static Grid */}
        <div className="flex gap-8 items-center flex-wrap justify-center border-t border-outline-variant pt-8">
          <div className="flex flex-col items-center gap-2">
            <ShapedImage
              shape="heart"
              src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop"
              size={100}
              alt="Cat"
            />
            <Typography variant="small">Heart</Typography>
          </div>

          <div className="flex flex-col items-center gap-2">
            <ShapedImage
              shape="arrow"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop"
              size={100}
              alt="Portrait"
            />
            <Typography variant="small">Scallop</Typography>
          </div>

          <div className="flex flex-col items-center gap-2">
            <ShapedImage
              shape="pill"
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"
              size={100}
              alt="Portrait"
            />
            <Typography variant="small">Pill</Typography>
          </div>
        </div>
      </div>
    );
  },
};

export const IconButtons: StoryObj = {
  name: "3. Shaped Icon Buttons",
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
  name: "4. Shaped Badges",
  render: () => (
    <div className="flex gap-8 items-center">
      <div className="relative">
        <Bell className="w-8 h-8 text-on-surface" />
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
  name: "5. Expressive FABs",
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
