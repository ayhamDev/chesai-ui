import type { Meta, StoryObj } from "@storybook/react";
import { TracePulseDashboard } from "./trace-pulse";

const meta: Meta<typeof TracePulseDashboard> = {
  title: "Showcase/TracePulse SaaS",
  component: TracePulseDashboard,
  parameters: {
    layout: "fullscreen",
  },
  docs: {
    description: {
      component: `
# TracePulse SaaS Dashboard

A specialized tracking interface designed for real-time device monitoring with a focus on "Path Discontinuity" recovery.

## Features Demonstrated:

1.  **Map.Route Styling**: Differentiates between 'Live' paths (Solid Primary Color) and 'Offline/Restored' paths (Dashed Error Color).
2.  **Map.AnimatedMarker**: Simulates smooth movement updates using the \`useMotionValue\` based hook inside the map component.
3.  **Sidebar Composition**: Uses \`Sidebar\`, \`Item\`, \`Badge\`, and \`Avatar\` to create a dense, informative device list.
4.  **Floating UI Overlays**: Uses \`Card\` with the \`glass\` variant for a modern HUD (Heads Up Display) feel over the map.
5.  **QR Code Generation**: Integrated pairing flow using the \`QRCode\` component within a \`Dialog\`.

## Scenario:
The user is tracking "Alex", a hiker who just exited a tunnel. 
- The **Red Dotted Line** shows where the signal was lost (the gap).
- The **Blue Solid Line** shows active tracking.
- The system has "backfilled" the red section once the device reconnected.
      `,
    },
  },
};

export default meta;
type Story = StoryObj<typeof TracePulseDashboard>;

export const Default: Story = {
  render: () => <TracePulseDashboard />,
};
