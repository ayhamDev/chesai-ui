import type { Meta, StoryObj } from "@storybook/react";
import { Shuffle, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../button";
import { Card } from "../card";
import { Typography } from "../typography";
import { Masonry } from "./masonry";

const meta: Meta<typeof Masonry> = {
  title: "Components/Layout/Masonry",
  component: Masonry,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A masonry layout (waterfall) that distributes items across columns. Unlike CSS Grid, this removes vertical gaps between items of varying heights. Powered by Framer Motion for smooth reordering.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Masonry>;

// --- MOCK DATA ---
const initialImages = [
  { id: "1", height: 200, color: "bg-red-200" },
  { id: "2", height: 300, color: "bg-orange-200" },
  { id: "3", height: 150, color: "bg-amber-200" },
  { id: "4", height: 400, color: "bg-yellow-200" },
  { id: "5", height: 250, color: "bg-lime-200" },
  { id: "6", height: 350, color: "bg-green-200" },
  { id: "7", height: 180, color: "bg-emerald-200" },
  { id: "8", height: 220, color: "bg-teal-200" },
  { id: "9", height: 320, color: "bg-cyan-200" },
  { id: "10", height: 280, color: "bg-sky-200" },
  { id: "11", height: 160, color: "bg-blue-200" },
  { id: "12", height: 380, color: "bg-indigo-200" },
];

// --- BASIC USAGE ---

export const Gallery: Story = {
  name: "Image Gallery",
  render: () => (
    <div className="max-w-4xl mx-auto">
      <Typography variant="title-small" className="mb-4">
        Photography Portfolio
      </Typography>
      <Masonry columns={{ default: 1, sm: 2, md: 3 }} gap="md">
        {initialImages.map((img) => (
          <Card
            key={img.id}
            padding="none"
            shape="minimal"
            className={`w-full relative overflow-hidden group ${img.color}`}
            style={{ height: img.height }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
              <Typography className="text-black/50 font-bold">
                #{img.id}
              </Typography>
            </div>
          </Card>
        ))}
      </Masonry>
    </div>
  ),
};

// --- INTERACTIVE ---

export const Interactive: Story = {
  name: "Add & Remove Items",
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [items, setItems] = useState(initialImages.slice(0, 6));

    const addItem = () => {
      const id = Date.now().toString();
      const height = 150 + Math.floor(Math.random() * 200);
      const color = "bg-gray-200";
      setItems([{ id, height, color }, ...items]);
    };

    const removeItem = (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const shuffleItems = () => {
      setItems((prev) => [...prev].sort(() => Math.random() - 0.5));
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/80 backdrop-blur-sm p-4 z-10 rounded-xl border border-graphite-border">
          <Typography variant="title-small">Dynamic Masonry</Typography>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={shuffleItems}>
              <Shuffle size={16} className="mr-2" /> Shuffle
            </Button>
            <Button size="sm" onClick={addItem}>
              <Plus size={16} className="mr-2" /> Add
            </Button>
          </div>
        </div>

        <Masonry columns={{ default: 2, md: 3, lg: 4 }} gap="md">
          {items.map((item) => (
            <Card
              key={item.id}
              className={`p-4 flex flex-col justify-between ${item.color}`}
              style={{ height: item.height }}
            >
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs opacity-50">#{item.id}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 bg-white/50 hover:bg-white/80 rounded-full transition-colors"
                  aria-label="Remove"
                >
                  <Trash2 size={14} className="text-red-600" />
                </button>
              </div>
              <Typography variant="body-small" className="font-bold opacity-70">
                Height: {item.height}px
              </Typography>
            </Card>
          ))}
        </Masonry>
      </div>
    );
  },
};

// --- VARIABLE CONTENT ---

export const Testimonials: Story = {
  name: "Text Content (Testimonials)",
  render: () => {
    const reviews = [
      {
        text: "This library is absolutely amazing. The animations are buttery smooth.",
        author: "Sarah J.",
      },
      {
        text: "I used to struggle with Masonry layouts, but this component makes it trivial. Just pass the columns prop!",
        author: "Mike T.",
      },
      {
        text: "Responsive design works out of the box.",
        author: "Davide",
      },
      {
        text: "The combination of Framer Motion and standard CSS grid concepts is powerful. I built my entire portfolio using this.",
        author: "Jessica R.",
      },
      {
        text: "Clean API.",
        author: "Tom",
      },
      {
        text: "Supports server-side rendering gracefully by defaulting to 1 column and then hydrating to the correct width.",
        author: "DevOps Dan",
      },
    ];

    return (
      <Masonry columns={{ default: 1, md: 2, lg: 3 }} gap="lg">
        {reviews.map((review, i) => (
          <Card key={i} className="bg-graphite-secondary border-none p-6">
            <Typography body-medium className="italic mb-4 text-lg">
              "{review.text}"
            </Typography>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-graphite-foreground/10" />
              <Typography variant="body-small" className="font-bold">
                {review.author}
              </Typography>
            </div>
          </Card>
        ))}
      </Masonry>
    );
  },
};
