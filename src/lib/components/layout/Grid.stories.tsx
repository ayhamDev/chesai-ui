import type { Meta, StoryObj } from "@storybook/react";
import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "../button";
import { Card } from "../card";
import { Typography } from "../typography";
import { Grid, GridItem } from "./grid";

const meta: Meta<typeof Grid> = {
  title: "Components/Layout/Grid",
  component: Grid,
  // Cast to avoid strict typing issues with subcomponents in some Storybook versions
  subcomponents: { GridItem } as Record<string, React.ComponentType<any>>,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A responsive CSS Grid wrapper powered by Framer Motion. It handles responsive column mapping and provides automatic layout animations (FLIP) when items change.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Grid>;

// --- BASIC USAGE ---

export const Responsive: Story = {
  name: "Responsive Columns",
  render: () => (
    <div className="space-y-4">
      <Typography variant="muted">
        Resize the window to see columns change (1 &rarr; 2 &rarr; 3 &rarr; 4).
      </Typography>
      <Grid columns={{ default: 1, sm: 2, md: 3, lg: 4 }} gap="md">
        {Array.from({ length: 8 }).map((_, i) => (
          // Using index is safe here as the list is static and never reordered
          <GridItem key={`static-item-${i}`}>
            <Card className="h-24 flex items-center justify-center bg-graphite-secondary/50 border-dashed">
              <span className="font-mono text-sm">Item {i + 1}</span>
            </Card>
          </GridItem>
        ))}
      </Grid>
    </div>
  ),
};

// --- BENTO GRID / DASHBOARD ---

export const DashboardLayout: Story = {
  name: "Bento Grid (Spans)",
  render: () => (
    <div className="max-w-4xl mx-auto">
      <Typography variant="h4" className="mb-4">
        Analytics Dashboard
      </Typography>
      <Grid
        columns={{ default: 1, md: 4 }}
        gap="md"
        className="auto-rows-[140px]"
      >
        {/* Large Widget */}
        <GridItem colSpan={{ default: 1, md: 2 }} rowSpan={2}>
          <Card className="h-full bg-blue-50 border-blue-100 flex flex-col justify-between p-6">
            <Typography variant="h3" className="text-blue-900">
              Total Revenue
            </Typography>
            <div className="text-5xl font-bold text-blue-600">$420k</div>
          </Card>
        </GridItem>

        {/* Small Widgets */}
        <GridItem>
          <Card className="h-full flex items-center justify-center flex-col gap-2">
            <Typography variant="muted">Active Users</Typography>
            <span className="text-2xl font-bold">1,234</span>
          </Card>
        </GridItem>
        <GridItem>
          <Card className="h-full flex items-center justify-center flex-col gap-2">
            <Typography variant="muted">Bounce Rate</Typography>
            <span className="text-2xl font-bold text-red-500">42%</span>
          </Card>
        </GridItem>

        {/* Wide Widget */}
        <GridItem colSpan={{ default: 1, md: 2 }}>
          <Card className="h-full bg-purple-50 border-purple-100 p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-200" />
            <div>
              <Typography variant="small" className="font-bold text-purple-900">
                New Feature Unlocked
              </Typography>
              <Typography variant="muted" className="text-xs">
                Check out the new analytics view
              </Typography>
            </div>
          </Card>
        </GridItem>

        {/* Tall Widget on Right */}
        <GridItem rowSpan={2} className="hidden md:block">
          <Card className="h-full bg-graphite-background p-4 border-dashed">
            <Typography variant="small" className="text-center w-full block">
              Sidebar Ad
            </Typography>
          </Card>
        </GridItem>

        <GridItem colSpan={{ default: 1, md: 3 }}>
          <Card className="h-full bg-green-50 border-green-100 p-6 flex items-center justify-between">
            <Typography className="text-green-800">System Status</Typography>
            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">
              OPERATIONAL
            </span>
          </Card>
        </GridItem>
      </Grid>
    </div>
  ),
};

// --- ANIMATION INTERACTION ---

export const Interactive: Story = {
  name: "Animated Filtering",
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [items, setItems] = useState([
      { id: 1, label: "React", color: "bg-blue-100 text-blue-800" },
      { id: 2, label: "Vue", color: "bg-green-100 text-green-800" },
      { id: 3, label: "Svelte", color: "bg-orange-100 text-orange-800" },
      { id: 4, label: "Angular", color: "bg-red-100 text-red-800" },
      { id: 5, label: "Solid", color: "bg-indigo-100 text-indigo-800" },
      { id: 6, label: "Qwik", color: "bg-purple-100 text-purple-800" },
      { id: 7, label: "Preact", color: "bg-yellow-100 text-yellow-800" },
    ]);

    const removeItem = (id: number) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    };

    return (
      <div className="max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h4">Tech Stack</Typography>
          <Button
            size="sm"
            variant="secondary"
            className="border border-graphite-border"
            onClick={() =>
              setItems([
                { id: Date.now(), label: "New Tech", color: "bg-gray-100" },
                ...items,
              ])
            }
          >
            Add Item
          </Button>
        </div>

        <Grid columns={{ default: 2, sm: 3, md: 4 }} gap="sm">
          {items.map((item) => (
            <GridItem key={item.id}>
              <Card
                className={`relative group h-20 flex items-center justify-center font-bold ${item.color}`}
              >
                {item.label}
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/20"
                  aria-label="Remove item"
                >
                  <X size={12} />
                </button>
              </Card>
            </GridItem>
          ))}
        </Grid>

        <Typography variant="muted" className="mt-6 text-sm">
          Click the "X" on hover to remove an item. Notice how the grid smoothly
          re-arranges itself.
        </Typography>
      </div>
    );
  },
};
