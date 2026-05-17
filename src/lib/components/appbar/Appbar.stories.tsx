import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowLeft,
  Menu,
  MoreVertical,
  Search,
  Settings,
  User,
} from "lucide-react";
import React, { useRef } from "react";
import { motion, useTransform } from "framer-motion";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { IconButton } from "../icon-button";
import { Input } from "../input";
import { Typography } from "../typography";
import { AppBar, useAppBarContext } from "./index";

const meta: Meta<typeof AppBar> = {
  title: "Components/Navigators/AppBar",
  component: AppBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The Material Design 3 Top App Bar. Supports four standardized variants: `small`, `center`, `medium`, and `large`. Features a native-feeling scroll morph animation where the title correctly scales from its MD3 Typography standard size and shifts into the top row. Now supports complex `expandedContent` injections with dynamic measuring, manual Context API morphing, and custom thresholds.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["small", "center", "medium", "large"],
    },
    scrollBehavior: {
      control: "select",
      options: ["pinned", "floating", "hide"],
    },
    color: {
      control: "select",
      options: [
        "surface",
        "surface-container-lowest",
        "surface-container-low",
        "surface-container",
        "surface-container-high",
        "surface-container-highest",
        "primary",
        "secondary",
        "transparent",
      ],
    },
    scrolledColor: {
      control: "select",
      options: [
        "surface",
        "surface-container-lowest",
        "surface-container-low",
        "surface-container",
        "surface-container-high",
        "surface-container-highest",
        "primary",
        "secondary",
        "transparent",
      ],
    },
    expandedAnimation: {
      control: "select",
      options: ["default", "none"],
    },
    elevateOnScroll: { control: "boolean" },
    collapsible: { control: "boolean" },
    title: { control: "text" },
    leadingIcon: { control: false },
    trailingIcons: { control: false },
    bottomContent: { control: false },
    topRowContent: { control: false },
    expandedContent: { control: false },
    scrollContainerRef: { control: false },
    collapsedHeight: { control: "number" },
    expandedHeight: { control: "number" },
    effectScrollThreshold: { control: "number" },
    collapseScrollDistance: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof AppBar>;

// Helper component to generate scrollable content
const DummyContent = () => (
  <main className="p-6">
    <Typography variant="title-medium">
      Scroll Down to See The Effect
    </Typography>
    <Typography variant="body-small" muted className="mt-2 mb-8 max-w-lg">
      The AppBar tracks the scroll position of its container and automatically
      fires its layout morphs and color changes based on exact measurements.
    </Typography>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="h-48 rounded-2xl bg-black/5 dark:bg-white/5" />
      ))}
    </div>
  </main>
);

const renderWithScrollContainer = (args: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const paddings = {
    small: "pt-[64px]",
    center: "pt-[64px]",
    medium: "pt-[112px]",
    large: "pt-[152px]",
  };

  const ptClass = args.customPaddingTop
    ? args.customPaddingTop
    : args.color === "transparent"
      ? ""
      : paddings[args.variant as keyof typeof paddings] || "pt-[64px]";

  return (
    <div className="h-[600px] bg-graphite-background relative overflow-hidden border border-outline-variant rounded-xl shadow-sm">
      <AppBar {...args} scrollContainerRef={scrollRef} />

      {args.color === "transparent" && (
        <div className="absolute top-0 inset-x-0 h-72">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop"
            alt="Mountains"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
        </div>
      )}

      <div
        ref={scrollRef}
        className={`h-full overflow-y-auto ${ptClass} relative z-10`}
      >
        {args.color === "transparent" && <div className="h-48" />}
        <div
          className={
            args.color === "transparent"
              ? "bg-graphite-background rounded-t-3xl min-h-full p-2"
              : ""
          }
        >
          <DummyContent />
        </div>
      </div>
    </div>
  );
};

export const Small: Story = {
  name: "1. Small (MD3 Default)",
  args: {
    variant: "small",
    title: "Small App Bar",
    leadingIcon: (
      <IconButton variant="ghost" aria-label="Menu">
        <Menu />
      </IconButton>
    ),
    trailingIcons: (
      <>
        <IconButton variant="ghost" aria-label="Search">
          <Search />
        </IconButton>
        <IconButton variant="ghost" aria-label="User Profile">
          <User />
        </IconButton>
      </>
    ),
  },
  render: renderWithScrollContainer,
};

export const CenterAligned: Story = {
  name: "2. Center Aligned",
  args: {
    variant: "center",
    title: "Centered Title",
    leadingIcon: (
      <IconButton variant="ghost" aria-label="Menu">
        <ArrowLeft />
      </IconButton>
    ),
    trailingIcons: (
      <IconButton variant="ghost" aria-label="User Profile">
        <User />
      </IconButton>
    ),
  },
  render: renderWithScrollContainer,
};

export const Medium: Story = {
  name: "3. Medium (Morphing)",
  args: {
    variant: "medium",
    title: "Medium App Bar",
    leadingIcon: (
      <IconButton variant="ghost" aria-label="Back">
        <ArrowLeft />
      </IconButton>
    ),
    trailingIcons: (
      <IconButton variant="ghost" aria-label="More">
        <MoreVertical />
      </IconButton>
    ),
  },
  render: renderWithScrollContainer,
};

export const Large: Story = {
  name: "4. Large (Morphing)",
  args: {
    variant: "large",
    title: "Large App Bar",
    leadingIcon: (
      <IconButton variant="ghost" aria-label="Back">
        <ArrowLeft />
      </IconButton>
    ),
    trailingIcons: (
      <>
        <IconButton variant="ghost" aria-label="Search">
          <Search />
        </IconButton>
        <IconButton variant="ghost" aria-label="More">
          <MoreVertical />
        </IconButton>
      </>
    ),
  },
  render: renderWithScrollContainer,
};

export const Floating: Story = {
  name: "5. Floating (Reveals Instantly)",
  args: {
    variant: "large",
    scrollBehavior: "floating",
    scrolledColor: "surface-container-high",
    title: "Floating App Bar",

    leadingIcon: (
      <IconButton variant="ghost">
        <Menu />
      </IconButton>
    ),

    collapsible: true
  },
  render: renderWithScrollContainer,
};

export const Hide: Story = {
  name: "6. Hide (Reveals at Top)",
  args: {
    variant: "large",
    scrollBehavior: "hide",
    title: "Hiding App Bar",

    leadingIcon: (
      <IconButton variant="ghost">
        <Menu />
      </IconButton>
    ),

    collapsible: true
  },
  render: renderWithScrollContainer,
};

export const NonCollapsible: Story = {
  name: "7. Non-Collapsing (Stays Large)",
  args: {
    variant: "large",
    title: "Always Large",
    collapsible: false,
    scrollBehavior: "hide",
    leadingIcon: (
      <IconButton variant="ghost">
        <Menu />
      </IconButton>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Setting `collapsible={false}` prevents the large app bar from shrinking. Paired with `scrollBehavior='hide'` here, it scrolls entirely out of view as a single massive block instead of morphing first.",
      },
    },
  },
  render: renderWithScrollContainer,
};

export const CustomSolid: Story = {
  name: "8. Custom Solid Color",
  args: {
    variant: "small",
    color: "primary",
    scrolledColor: "primary",
    elevateOnScroll: true,
    title: "Solid Primary",
    leadingIcon: (
      <IconButton variant="ghost" className="text-on-primary hover:bg-white/10">
        <ArrowLeft />
      </IconButton>
    ),
    trailingIcons: (
      <IconButton variant="ghost" className="text-on-primary hover:bg-white/10">
        <Search />
      </IconButton>
    ),
  },
  render: renderWithScrollContainer,
};

export const TransparentToSolid: Story = {
  name: "9. Transparent to Solid",
  args: {
    variant: "center",
    color: "transparent",
    scrolledColor: "surface",
    title: "Mountains",
    leadingIcon: (
      <IconButton variant="ghost" className="text-white hover:bg-white/20">
        <ArrowLeft />
      </IconButton>
    ),
    trailingIcons: (
      <IconButton variant="ghost" className="text-white hover:bg-white/20">
        <Search />
      </IconButton>
    ),
  },
  render: renderWithScrollContainer,
};

export const AdvancedExpandedContent: Story = {
  name: "10. Advanced Search Content",
  args: {
    variant: "large",
    color: "surface-container-low",
    scrolledColor: "surface-container",
    elevateOnScroll: true,
    customPaddingTop: "pt-[180px]",
    topRowContent: <Typography variant="title-large">Find Places</Typography>,
    expandedContent: (
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Search for restaurants, hotels..."
          variant="filled"
          startContent={<Search className="text-on-surface-variant w-4 h-4" />}
          className="shadow-sm"
        />
        <div className="flex gap-2">
          <Badge variant="secondary">Restaurants</Badge>
          <Badge variant="secondary">Hotels</Badge>
          <Badge variant="secondary">Activities</Badge>
        </div>
      </div>
    ),
    leadingIcon: (
      <IconButton variant="ghost">
        <ArrowLeft />
      </IconButton>
    ),
    trailingIcons: (
      <IconButton variant="ghost">
        <MoreVertical />
      </IconButton>
    ),
  },
  render: renderWithScrollContainer,
};

const CustomMorphingHeader = () => {
  const { collapseProgress } = useAppBarContext();

  const avatarY = useTransform(collapseProgress, [0, 1], [0, -50]);
  const avatarX = useTransform(collapseProgress, [0, 1], [0, 48]);
  const avatarScale = useTransform(collapseProgress, [0, 1], [1, 0.4]);

  const textX = useTransform(collapseProgress, [0, 1], [0, -15]);
  const textY = useTransform(collapseProgress, [0, 1], [0, -54]);
  const textScale = useTransform(collapseProgress, [0, 1], [1, 0.75]);

  const subtitleOpacity = useTransform(collapseProgress, [0, 0.6], [1, 0]);

  return (
    <div className="relative h-[96px] w-full pointer-events-none">
      <motion.div
        style={{
          scale: avatarScale,
          x: avatarX,
          y: avatarY,
          willChange: "transform",
        }}
        className="absolute top-0 left-0 origin-top-left pointer-events-auto transform-gpu"
      >
        <Avatar
          src="https://i.pravatar.cc/150?u=a"
          size="xl"
          className="shadow-sm border-2 border-surface"
        />
      </motion.div>

      <motion.div
        style={{
          scale: textScale,
          x: textX,
          y: textY,
          willChange: "transform",
        }}
        className="absolute top-2 left-[112px] origin-top-left pointer-events-auto flex flex-col transform-gpu"
      >
        <Typography
          variant="headline-medium"
          className="font-bold leading-tight"
        >
          Alex Morgan
        </Typography>
        <motion.div
          style={{ opacity: subtitleOpacity, willChange: "opacity" }}
          className="transform-gpu"
        >
          <Typography variant="body-medium" className="opacity-70 mt-1">
            alex.morgan@example.com
          </Typography>
        </motion.div>
      </motion.div>
    </div>
  );
};

export const ManualMorphing: Story = {
  name: "11. Manual Morphing (Context API)",
  args: {
    variant: "large",
    color: "surface",
    scrolledColor: "surface-container-low",
    elevateOnScroll: true,
    customPaddingTop: "pt-[180px]",
    expandedHeight: 120,
    effectScrollThreshold: 50,
    expandedAnimation: "none",
    leadingIcon: (
      <IconButton variant="ghost">
        <ArrowLeft />
      </IconButton>
    ),
    trailingIcons: (
      <IconButton variant="ghost">
        <Settings />
      </IconButton>
    ),
    expandedContent: <CustomMorphingHeader />,
  },
  render: renderWithScrollContainer,
};

export const CustomThresholds: Story = {
  name: "12. Custom Sizes & Thresholds",
  args: {
    variant: "large",
    color: "surface",
    scrolledColor: "primary",
    elevateOnScroll: true,
    collapsedHeight: 80,
    expandedHeight: 120,
    effectScrollThreshold: 150,
    collapseScrollDistance: 300,
    title: "Slow Collapse",
    leadingIcon: (
      <IconButton variant="ghost">
        <Menu />
      </IconButton>
    ),
    trailingIcons: (
      <IconButton variant="ghost">
        <MoreVertical />
      </IconButton>
    ),
    customPaddingTop: "pt-[200px]",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Override the default MD3 sizing and scroll thresholds. Here, the collapsed bar is 80px tall, the expanded area is 120px tall. The scroll color shift won't happen until you scroll 150px, and the collapse animation is stretched over 300px of scrolling.",
      },
    },
  },
  render: renderWithScrollContainer,
};
