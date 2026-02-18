import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { Shape } from "./index";
import { SHAPE_PATHS, type ShapeType } from "./paths";
import { Card } from "../card";
import { Typography } from "../typography";

const meta: Meta<typeof Shape> = {
  title: "Components/Media/Shape",
  component: Shape,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    shape: {
      control: "select",
      options: Object.keys(SHAPE_PATHS),
    },
    className: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Shape>;

export const Default: Story = {
  args: {
    shape: "circle",
    className: "w-64 h-64 text-graphite-primary",
  },
};

export const AutoMorph: Story = {
  name: "Auto Morph Loop",
  render: () => {
    const shapes = Object.keys(SHAPE_PATHS) as ShapeType[];
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % shapes.length);
      }, 1500); // Change shape every 1.5s
      return () => clearInterval(interval);
    }, [shapes.length]);

    return (
      <div className="flex flex-col items-center gap-4">
        <Shape
          shape={shapes[index]}
          className="w-64 h-64 text-graphite-primary transition-colors duration-500"
        />
        <Typography variant="title-small" className="capitalize">
          {shapes[index]}
        </Typography>
      </div>
    );
  },
};

export const InteractiveGrid: Story = {
  name: "Interactive Grid",
  render: () => {
    const [selectedShape, setSelectedShape] = useState<ShapeType>("circle");
    const shapes = Object.keys(SHAPE_PATHS) as ShapeType[];

    return (
      <div className="flex flex-col md:flex-row gap-12 items-start max-w-5xl">
        {/* Preview Area */}
        <div className="sticky top-10 flex flex-col items-center justify-center p-8 bg-graphite-secondary/30 rounded-3xl min-w-[300px]">
          <Shape
            shape={selectedShape}
            className="w-64 h-64 text-graphite-primary drop-shadow-xl"
          />
          <Typography variant="display-small" className="mt-8 capitalize">
            {selectedShape}
          </Typography>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {shapes.map((shapeName) => (
            <button
              key={shapeName}
              type="button"
              onClick={() => setSelectedShape(shapeName)}
              className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-graphite-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-graphite-primary"
            >
              <div className="w-16 h-16 p-2 bg-white rounded-lg shadow-sm">
                <Shape shape={shapeName} className="w-full h-full text-black" />
              </div>
              <span className="text-xs text-center font-medium capitalize text-graphite-foreground/70">
                {shapeName}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  },
};

export const UsageInCards: Story = {
  name: "Usage in UI Cards",
  render: () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        <Card className="p-6 flex items-center gap-4">
          <div className="w-16 h-16 shrink-0">
            <Shape shape="flower" className="w-full h-full text-pink-500" />
          </div>
          <div>
            <Typography variant="title-small">Expressive Icons</Typography>
            <Typography variant="body-small" muted={true}>
              Using complex shapes as backgrounds for icons or avatars.
            </Typography>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-4">
          <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
            <Shape shape="sunny" className="absolute inset-0 text-blue-100" />
            <span className="relative font-bold text-blue-600 text-xl">
              1st
            </span>
          </div>
          <div>
            <Typography variant="title-small">Badges</Typography>
            <Typography variant="body-small" muted={true}>
              Unique geometry for awards or notifications.
            </Typography>
          </div>
        </Card>
      </div>
    );
  },
};
