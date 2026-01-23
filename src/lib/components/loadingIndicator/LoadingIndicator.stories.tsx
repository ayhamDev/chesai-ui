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
      options: ["material-morph", "material-morph-background"],
      description: "The visual style of the loader.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingIndicator>;

export const MaterialDesign3: Story = {
  name: "Material Morph (MD3)",
  args: {
    variant: "material-morph-background",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Uses the official Material Design 3 shape assets to create an expressive, morphing, and rotating loading indicator.",
      },
    },
  },
  render: ({ variant }) => (
    <div className="flex gap-8 items-center">
      <LoadingIndicator variant={variant} className="w-8 h-8" />
      <LoadingIndicator variant={variant} className="w-12 h-12 text-blue-500" />
      <LoadingIndicator
        variant={variant}
        className="w-24 h-24 text-purple-600"
      />
    </div>
  ),
};
