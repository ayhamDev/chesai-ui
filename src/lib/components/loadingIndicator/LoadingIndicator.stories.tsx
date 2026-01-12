import type { Meta, StoryObj } from "@storybook/react";
import { LoadingIndicator } from ".";
import { Card } from "../card";
import { Typography } from "../typography";

const meta: Meta<typeof LoadingIndicator> = {
  title: "Components/Feedback/LoadingIndicator",
  component: LoadingIndicator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A collection of loading indicators using SVG and CSS animations. They utilize the global theme colors (`graphite-primary` and `graphite-secondary`) by default.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "linear-straight",
        "linear-wavy",
        "circular-straight",
        "circular-wavy",
        "material-morph",
      ],
      description: "The visual style of the loader.",
    },
    thickness: {
      control: "select",
      options: ["normal", "thick"],
      description: "The stroke width of the indicator.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingIndicator>;

export const Default: Story = {
  args: {
    variant: "linear-straight",
    thickness: "normal",
  },
};

export const AllVariants: Story = {
  name: "All Variants",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
      {/* Linear Straight */}
      <Card className="flex flex-col items-center justify-center gap-4 min-h-[160px]">
        <Typography variant="small" className="text-muted-foreground">
          Linear Straight
        </Typography>
        <LoadingIndicator variant="linear-straight" />
      </Card>

      {/* Linear Wavy */}
      <Card className="flex flex-col items-center justify-center gap-4 min-h-[160px]">
        <Typography variant="small" className="text-muted-foreground">
          Linear Wavy
        </Typography>
        <LoadingIndicator variant="linear-wavy" />
      </Card>

      {/* Circular Straight */}
      <Card className="flex flex-col items-center justify-center gap-4 min-h-[160px]">
        <Typography variant="small" className="text-muted-foreground">
          Circular Straight
        </Typography>
        <LoadingIndicator variant="circular-straight" />
      </Card>

      {/* Circular Wavy */}
      <Card className="flex flex-col items-center justify-center gap-4 min-h-[160px]">
        <Typography variant="small" className="text-muted-foreground">
          Circular Wavy
        </Typography>
        <LoadingIndicator variant="circular-wavy" />
      </Card>
    </div>
  ),
};

export const ThicknessComparison: Story = {
  name: "Thickness: Normal vs Thick",
  render: () => (
    <div className="flex flex-col gap-8 w-80">
      <div className="space-y-2">
        <Typography variant="small">Normal</Typography>
        <LoadingIndicator variant="linear-straight" thickness="normal" />
        <LoadingIndicator variant="circular-straight" thickness="normal" />
      </div>
      <div className="space-y-2">
        <Typography variant="small">Thick</Typography>
        <LoadingIndicator variant="linear-straight" thickness="thick" />
        <LoadingIndicator variant="circular-straight" thickness="thick" />
      </div>
    </div>
  ),
};

export const CustomSizing: Story = {
  name: "Custom Sizing",
  parameters: {
    docs: {
      description: {
        story:
          "You can control the size of the indicators using standard Tailwind `w-*` and `h-*` classes via the `className` prop.",
      },
    },
  },
  render: () => (
    <div className="flex items-end gap-8">
      <LoadingIndicator
        variant="circular-straight"
        className="w-6 h-6" // Small
      />
      <LoadingIndicator
        variant="circular-straight"
        className="w-12 h-12" // Medium
      />
      <LoadingIndicator
        variant="circular-straight"
        className="w-24 h-24" // Large
      />
    </div>
  ),
};

export const CustomColors: Story = {
  name: "Custom Colors",
  parameters: {
    docs: {
      description: {
        story:
          "The component uses `graphite-primary` and `graphite-secondary` by default. You can override these using Tailwind text/stroke/bg modifiers in `className` or by defining CSS variables in a parent container.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      {/* Override via text colors for SVG strokes */}
      <div className="space-y-2">
        <Typography variant="small">Utility Class Overrides (Red)</Typography>
        {/* 
            Note: For SVG based variants (wavy/circular), we can target children using arbitrary variants 
            or simply rely on CSS variables if the component supported 'currentColor'. 
            
            Since the component hardcodes 'stroke-graphite-primary', 
            we can override it using specific selector strategies or by setting the CSS variables inline.
        */}
        <div
          style={
            {
              "--color-graphite-primary": "#ef4444", // Red-500
              "--color-graphite-secondary": "#fee2e2", // Red-100
            } as React.CSSProperties
          }
        >
          <LoadingIndicator variant="linear-straight" className="mb-4" />
          <LoadingIndicator variant="circular-straight" />
        </div>
      </div>

      <div className="space-y-2">
        <Typography variant="small">Utility Class Overrides (Blue)</Typography>
        <div
          style={
            {
              "--color-graphite-primary": "#3b82f6", // Blue-500
              "--color-graphite-secondary": "#dbeafe", // Blue-100
            } as React.CSSProperties
          }
        >
          <LoadingIndicator variant="linear-wavy" className="mb-4" />
          <LoadingIndicator variant="circular-wavy" />
        </div>
      </div>
    </div>
  ),
};

export const MaterialDesign3: Story = {
  name: "Material Morph (MD3)",
  args: {
    variant: "material-morph",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Uses the official Material Design 3 shape assets to create an expressive, morphing, and rotating loading indicator.",
      },
    },
  },
  render: () => (
    <div className="flex gap-8 items-center">
      <LoadingIndicator variant="material-morph" className="w-8 h-8" />
      <LoadingIndicator
        variant="material-morph"
        className="w-12 h-12 text-blue-500"
      />
      <LoadingIndicator
        variant="material-morph"
        className="w-24 h-24 text-purple-600"
      />
    </div>
  ),
};
