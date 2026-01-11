import type { Meta, StoryObj } from "@storybook/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "../button";
import { Card } from "../card";
import { Typography } from "../typography";
import { Flex } from "./flex";
import { Grid, GridItem } from "./grid";
import { Masonry } from "./masonry";

const meta: Meta = {
  title: "Components/Layout",
  parameters: {
    layout: "padded",
  },
};

export default meta;

// --- MOCK DATA ---
const images = [
  { h: 200, color: "bg-red-200", id: "img1" },
  { h: 300, color: "bg-blue-200", id: "img2" },
  { h: 150, color: "bg-green-200", id: "img3" },
  { h: 400, color: "bg-yellow-200", id: "img4" },
  { h: 250, color: "bg-purple-200", id: "img5" },
  { h: 350, color: "bg-pink-200", id: "img6" },
  { h: 180, color: "bg-indigo-200", id: "img7" },
  { h: 220, color: "bg-orange-200", id: "img8" },
  { h: 320, color: "bg-teal-200", id: "img9" },
  { h: 280, color: "bg-cyan-200", id: "img10" },
];

// --- GRID STORIES ---

export const GridResponsive: StoryObj = {
  name: "Grid: Responsive & Staggered",
  render: () => {
    const [items, setItems] = useState(
      Array.from({ length: 12 }, (_, i) => ({ id: `item-${i}`, val: i }))
    );

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() =>
              setItems((prev) => [
                ...prev,
                { id: `item-${Date.now()}`, val: prev.length },
              ])
            }
          >
            Add Item
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setItems((prev) => prev.slice(0, -1))}
          >
            Remove Item
          </Button>
        </div>

        <Grid columns={{ default: 1, sm: 2, md: 3, lg: 4 }} gap="md" stagger>
          {items.map((item) => (
            <GridItem
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="h-32 rounded-xl bg-graphite-card border border-graphite-border flex items-center justify-center shadow-sm"
            >
              <Typography variant="h4">{item.val + 1}</Typography>
            </GridItem>
          ))}
        </Grid>
      </div>
    );
  },
};

// --- FLEX STORIES ---

export const FlexLayout: StoryObj = {
  name: "Flex: Wrapping Tags",
  render: () => (
    <Card className="max-w-md">
      <Typography variant="h4" className="mb-4">
        Interests
      </Typography>
      <Flex gap="sm" wrap="wrap">
        {[
          "React",
          "TypeScript",
          "Tailwind",
          "Framer Motion",
          "Design Systems",
          "Accessibility",
          "Performance",
          "UX/UI",
        ].map((tag) => (
          <motion.div
            key={tag}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 rounded-full bg-graphite-secondary text-sm font-medium cursor-pointer"
          >
            {tag}
          </motion.div>
        ))}
      </Flex>
    </Card>
  ),
};

// --- MASONRY STORIES ---

export const MasonryLayout: StoryObj = {
  name: "Masonry: Image Gallery",
  render: () => {
    const [items, setItems] = useState(images);

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Typography variant="h3">Masonry Gallery</Typography>
          <Button
            size="sm"
            onClick={() => {
              // Shuffle for demo
              setItems([...items].sort(() => Math.random() - 0.5));
            }}
          >
            Shuffle
          </Button>
        </div>

        <Masonry columns={{ default: 1, sm: 2, md: 3 }} gap="md">
          {items.map((img, i) => (
            <Card
              key={img.id}
              padding="none"
              shape="minimal"
              className={`w-full overflow-hidden ${img.color}`}
              style={{ height: img.h }}
            >
              <div className="w-full h-full flex items-center justify-center opacity-20 text-4xl font-bold">
                {i + 1}
              </div>
            </Card>
          ))}
        </Masonry>
      </div>
    );
  },
};
