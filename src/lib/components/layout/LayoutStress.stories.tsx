import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../button";
import { Card } from "../card";
import { Typography } from "../typography";
import { Flex } from "./flex";
import { Grid } from "./grid";
import { Masonry } from "./masonry";

const meta: Meta = {
  title: "Components/Layout/Stress Tests (Non-Virtualized)",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
# ⚠️ Performance Stress Test

These stories render **2,000 items** directly into the DOM using the standard layout components with Framer Motion animations enabled.

**Compare this to the Virtual* components:**
1. **Initial Load:** You will notice a significant delay before the list appears.
2. **Memory:** The browser tab memory usage will spike.
3. **Resizing:** Try resizing the window. The \`layout\` prop from Framer Motion will attempt to animate 2,000 items simultaneously, causing massive frame drops.
        `,
      },
    },
  },
};

export default meta;

// Generate 2,000 items (Virtual examples handle 10,000+ easily)
const itemCount = 2000;
const heavyData = Array.from({ length: itemCount }, (_, i) => ({
  id: i,
  text: `Item ${i + 1}`,
  color: `hsl(${i % 360}, 70%, 85%)`,
  darkColor: `hsl(${i % 360}, 70%, 35%)`,
  height: 100 + (i % 5) * 40, // Varied heights for masonry
}));

export const GridStress: StoryObj = {
  name: "1. Grid (2,000 DOM Nodes)",
  render: () => {
    // We use state to trigger re-renders if needed
    const [items] = useState(heavyData);

    return (
      <div className="space-y-4">
        <Typography variant="h4">
          Rendering {items.length} items without virtualization
        </Typography>
        <Typography variant="muted">
          Notice the lag on initial render and when resizing the window.
        </Typography>

        <Grid
          // Responsive columns
          columns={{ default: 2, md: 3, lg: 4, xl: 6 }}
          gap="sm"
          className="w-full"
        >
          {items.map((item) => (
            <Card
              key={item.id}
              shape="minimal"
              padding="sm"
              className="h-24 flex items-center justify-center border-none shadow-sm"
              style={{ backgroundColor: item.color }}
            >
              <span
                className="font-bold font-mono"
                style={{ color: item.darkColor }}
              >
                {item.text}
              </span>
            </Card>
          ))}
        </Grid>
      </div>
    );
  },
};

export const FlexStress: StoryObj = {
  name: "2. Flex (2,000 DOM Nodes)",
  render: () => {
    const [items] = useState(heavyData);

    return (
      <div className="space-y-4">
        <Typography variant="h4">Flex Wrap Stress Test</Typography>

        <Flex gap="xs" wrap="wrap">
          {items.map((item) => (
            <div
              key={item.id}
              className="px-3 py-1 rounded-full text-xs font-bold border border-black/5"
              style={{
                backgroundColor: item.color,
                color: item.darkColor,
              }}
            >
              {item.text}
            </div>
          ))}
        </Flex>
      </div>
    );
  },
};

export const MasonryStress: StoryObj = {
  name: "3. Masonry (2,000 DOM Nodes)",
  render: () => {
    const [items] = useState(heavyData);

    return (
      <div className="space-y-4">
        <Typography variant="h4">Masonry Stress Test</Typography>
        <Typography variant="muted">
          Calculating column distribution for 2,000 items takes time on the JS
          thread.
        </Typography>

        <Masonry columns={{ default: 2, md: 3, lg: 4, xl: 5 }} gap="md">
          {items.map((item) => (
            <Card
              key={item.id}
              shape="minimal"
              padding="none"
              className="flex items-center justify-center shadow-sm border-none mb-4"
              style={{
                backgroundColor: item.color,
                height: item.height, // Varied height
              }}
            >
              <span className="font-bold" style={{ color: item.darkColor }}>
                {item.text}
              </span>
            </Card>
          ))}
        </Masonry>
      </div>
    );
  },
};
