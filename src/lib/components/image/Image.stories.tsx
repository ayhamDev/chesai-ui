import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Image } from "./index";
import { Grid, GridItem } from "../layout/grid";
import { Typography } from "../typography";
import { AlertCircle } from "lucide-react";

const meta: Meta<typeof Image> = {
  title: "Components/Media/Image",
  component: Image,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An advanced Image component with support for progressive blur-up loading, skeletons, and composable effects like 'inspect' and 'zoom'.",
      },
    },
  },
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    width: { control: "number" },
    height: { control: "number" },
    effects: {
      control: "multi-select",
      options: ["inspect", "zoom"],
      description: "Enabled interaction effects.",
    },
    shape: {
      control: "select",
      options: ["none", "sm", "md", "lg", "full"],
    },
    variant: {
      control: "select",
      options: ["default", "bordered", "elevated"],
    },
    aspectRatio: {
      control: "select",
      options: ["auto", "square", "video", "portrait", "wide"],
    },
    zoomOnHover: { control: "boolean" },
    showSkeleton: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Image>;

// --- ASSETS ---
const HIGH_RES_LANDSCAPE =
  "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=2000&auto=format&fit=crop";
const LOW_RES_LANDSCAPE =
  "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=10&w=50&auto=format&fit=crop";
const PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000";
const PORTRAIT_IMAGE =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800";

// --- STORIES ---

// 1. DEFAULT
export const Default: Story = {
  name: "1. Default",
  args: {
    src: HIGH_RES_LANDSCAPE,
    alt: "A stunning desert landscape with rock formations.",
    width: 500,
    height: 350,
    shape: "lg",
  },
};

// 2. VARIANTS
export const Variants: Story = {
  name: "2. Variants",
  parameters: {
    docs: {
      description: {
        story:
          "The component has three visual variants: `default`, `bordered` (with a subtle outline), and `elevated` (with a shadow).",
      },
    },
  },
  render: (args) => (
    <Grid columns={3} gap={8} className="w-[800px]">
      <GridItem className="flex flex-col gap-2 items-center">
        <Typography variant="body-s" className="text-muted-foreground">
          Default
        </Typography>
        <Image {...args} variant="default" />
      </GridItem>
      <GridItem className="flex flex-col gap-2 items-center">
        <Typography variant="body-s" className="text-muted-foreground">
          Bordered
        </Typography>
        <Image {...args} variant="bordered" />
      </GridItem>
      <GridItem className="flex flex-col gap-2 items-center">
        <Typography variant="body-s" className="text-muted-foreground">
          Elevated
        </Typography>
        <Image {...args} variant="elevated" />
      </GridItem>
    </Grid>
  ),
  args: {
    src: PRODUCT_IMAGE,
    alt: "A silver and black analog watch.",
    width: 250,
    height: 250,
    shape: "md",
    aspectRatio: "square",
  },
};

// 3. SHAPES
export const Shapes: Story = {
  name: "3. Shapes",
  parameters: {
    docs: {
      description: {
        story:
          "Use the `shape` prop to control the border-radius of the container. `full` is ideal for square aspect-ratio images.",
      },
    },
  },
  render: (args) => (
    <Grid columns={5} gap={4} className="w-[900px]">
      {(["none", "sm", "md", "lg", "full"] as const).map((shape) => (
        <GridItem key={shape} className="flex flex-col gap-2 items-center">
          <Typography variant="body-s" className="text-muted-foreground">
            {shape}
          </Typography>
          <Image {...args} shape={shape} />
        </GridItem>
      ))}
    </Grid>
  ),
  args: {
    src: PORTRAIT_IMAGE,
    alt: "A person's portrait.",
    width: 150,
    height: 150,
    aspectRatio: "square",
  },
};

// 4. ASPECT RATIOS
export const AspectRatios: Story = {
  name: "4. Aspect Ratios",
  parameters: {
    docs: {
      description: {
        story:
          "The `aspectRatio` prop sets the container's proportions, making it easy to create consistent layouts. The image inside will be `object-cover`'ed.",
      },
    },
  },
  render: (args) => (
    <Grid columns={2} gap={4} className="w-[800px]">
      {(["square", "video", "portrait", "wide"] as const).map((ratio) => (
        <GridItem key={ratio} className="flex flex-col gap-2">
          <Typography variant="body-s" className="text-muted-foreground">
            {ratio}
          </Typography>
          <Image {...args} aspectRatio={ratio} />
        </GridItem>
      ))}
    </Grid>
  ),
  args: {
    src: HIGH_RES_LANDSCAPE,
    alt: "A desert landscape.",
    width: 380,
    shape: "md",
  },
};

// 5. LOADING STATES
export const LoadingStates: Story = {
  name: "5. Loading States",
  parameters: {
    docs: {
      description: {
        story:
          "The component provides two loading states out-of-the-box: a shimmer `skeleton` (default) and a progressive `blur-up` effect if `placeholderSrc` is provided.",
      },
    },
  },
  render: (args) => (
    <Grid columns={2} gap={6} className="w-[800px]">
      <GridItem className="flex flex-col gap-2">
        <Typography variant="body-s" className="text-muted-foreground">
          Skeleton Loader (Default)
        </Typography>
        <Image
          {...args}
          // Using a delay service to simulate slow loading
          src={`https://www.deelay.me/3000/${HIGH_RES_LANDSCAPE}`}
          alt="Slow loading image with skeleton."
          key="skeleton" // Add key to force re-mount on story change
        />
      </GridItem>
      <GridItem className="flex flex-col gap-2">
        <Typography variant="body-s" className="text-muted-foreground">
          Blur-up Placeholder
        </Typography>
        <Image
          {...args}
          src={HIGH_RES_LANDSCAPE}
          placeholderSrc={LOW_RES_LANDSCAPE}
          alt="Image with a blur-up placeholder."
          key="blur-up"
        />
      </GridItem>
    </Grid>
  ),
  args: {
    width: 380,
    height: 250,
    shape: "lg",
  },
};

// 6. FALLBACK STATE
export const FallbackState: Story = {
  name: "6. Fallback State",
  parameters: {
    docs: {
      description: {
        story:
          "If the image `src` fails to load, a fallback UI is displayed. You can provide a custom fallback component via the `fallback` prop.",
      },
    },
  },
  render: (args) => (
    <Grid columns={2} gap={6} className="w-[800px]">
      <GridItem className="flex flex-col gap-2">
        <Typography variant="body-s" className="text-muted-foreground">
          Default Fallback
        </Typography>
        <Image {...args} />
      </GridItem>
      <GridItem className="flex flex-col gap-2">
        <Typography variant="body-s" className="text-muted-foreground">
          Custom Fallback
        </Typography>
        <Image
          {...args}
          fallback={
            <div className="flex flex-col items-center justify-center text-destructive">
              <AlertCircle className="w-8 h-8 mb-2" />
              <span className="text-xs font-semibold">Custom Error!</span>
              <span className="text-xs">Could not load resource.</span>
            </div>
          }
        />
      </GridItem>
    </Grid>
  ),
  args: {
    src: "https://invalid-url.com/image.jpg",
    alt: "An image that will fail to load.",
    width: 380,
    height: 250,
    shape: "lg",
    variant: "bordered",
  },
};

// 7. EFFECTS
export const ZoomOnHover: Story = {
  name: "7. Effect: Zoom on Hover",
  parameters: {
    docs: {
      description: {
        story:
          "Set `zoomOnHover={true}` for a simple and elegant scale effect on mouse hover. This is a purely visual effect and does not use a modal.",
      },
    },
  },
  args: {
    zoomOnHover: true,
    src: PRODUCT_IMAGE,
    alt: "A watch that zooms on hover.",
    width: 400,
    height: 400,
    shape: "lg",
    aspectRatio: "square",
  },
};

export const InspectEffect: Story = {
  name: "8. Effect: Inspect (Lens)",
  parameters: {
    docs: {
      description: {
        story:
          "Pass `effects={['inspect']}` to enable a magnifying lens effect on hover, perfect for inspecting product details.",
      },
    },
  },
  args: {
    effects: ["inspect"],
    src: PRODUCT_IMAGE,
    alt: "Product Watch",
    width: 400,
    height: 400,
    shape: "lg",
    aspectRatio: "square",
  },
};

export const ZoomEffect: Story = {
  name: "9. Effect: Zoom (Lightbox)",
  parameters: {
    docs: {
      description: {
        story:
          "Pass `effects={['zoom']}` to enable a smooth layout transition to a full-screen lightbox on click. Press `ESC` or click the background to close.",
      },
    },
  },
  args: {
    effects: ["zoom"],
    src: HIGH_RES_LANDSCAPE,
    placeholderSrc: LOW_RES_LANDSCAPE,
    alt: "Expandable landscape",
    width: 500,
    height: 300,
    shape: "lg",
  },
};

export const ComposedEffects: Story = {
  name: "10. Composed: Inspect + Zoom",
  parameters: {
    docs: {
      description: {
        story:
          "Pass `effects={['inspect', 'zoom']}` to enable both. Hover to inspect details, click to open full screen.",
      },
    },
  },
  args: {
    effects: ["inspect", "zoom"],
    src: PRODUCT_IMAGE,
    alt: "Product",
    width: 400,
    height: 400,
    shape: "lg",
  },
};
