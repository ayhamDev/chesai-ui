import type { Meta, StoryObj } from "@storybook/react";
import { Sparkles, Scissors, Mail } from "lucide-react";
import { Typography } from "../typography";
import { Divider } from "./index";
import { Card } from "../card";

const meta: Meta<typeof Divider> = {
  title: "Components/Data/Divider",
  component: Divider,
  tags: ["autodocs"],
  argTypes: {
    shape: {
      control: "select",
      options: ["regular", "wavy"],
      description: "The physical shape of the line.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Thickness of the line.",
    },
    waveSize: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Width/Frequency of the waves (only affects wavy shape).",
      if: { arg: "shape", eq: "wavy" },
    },
    color: {
      control: "select",
      options: ["default", "primary", "secondary", "tertiary", "error"],
    },
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
    },
    variant: {
      control: "select",
      options: ["solid", "dashed", "dotted"],
      if: { arg: "shape", eq: "regular" }, // Variant only applies to regular lines
    },
    textAlign: {
      control: "select",
      options: ["start", "center", "end"],
      if: { arg: "orientation", eq: "horizontal" },
    },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  args: {
    orientation: "horizontal",
    shape: "regular",
    size: "sm",
  },
  render: (args) => (
    <div className="w-96 flex flex-col gap-2">
      <Typography variant="body-medium">Section One</Typography>
      <Divider {...args} />
      <Typography variant="body-medium">Section Two</Typography>
    </div>
  ),
};

export const Wavy: Story = {
  name: "Wavy Shape",
  args: {
    shape: "wavy",
    color: "primary",
    size: "sm",
    waveSize: "md",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `wavy` shape renders a responsive SVG sine-wave pattern. You can control the `size` (stroke thickness) and `waveSize` (width of the wave).",
      },
    },
  },
  render: (args) => (
    <div className="w-96 flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <Typography variant="label-medium">Small Wave (sm/sm)</Typography>
        <Divider {...args} size="sm" waveSize="sm" />
      </div>

      <div className="flex flex-col gap-1">
        <Typography variant="label-medium">Standard Wave (md/md)</Typography>
        <Divider {...args} size="md" waveSize="md" />
      </div>

      <div className="flex flex-col gap-1">
        <Typography variant="label-medium">Bold Wide Wave (lg/lg)</Typography>
        <Divider {...args} size="lg" waveSize="lg" />
      </div>

      <div className="flex flex-col gap-1">
        <Typography variant="label-medium">
          Mixed (Thick line, tight wave)
        </Typography>
        <Divider {...args} size="lg" waveSize="sm" />
      </div>
    </div>
  ),
};

export const ColorVariations: Story = {
  name: "Color Variations",
  render: () => (
    <div className="w-96 flex flex-col gap-8">
      <div>
        <Typography variant="body-small">Default</Typography>
        <Divider />
      </div>
      <div>
        <Typography variant="body-small" className="text-primary">
          Primary
        </Typography>
        <Divider color="primary" />
      </div>
      <div>
        <Typography variant="body-small" className="text-secondary">
          Secondary
        </Typography>
        <Divider color="secondary" />
      </div>
      <div>
        <Typography variant="body-small" className="text-tertiary">
          Tertiary
        </Typography>
        <Divider color="tertiary" />
      </div>
      <div>
        <Typography variant="body-small" className="text-error">
          Error
        </Typography>
        <Divider color="error" />
      </div>
    </div>
  ),
};

export const Thickness: Story = {
  name: "Line Thickness (Size)",
  args: { variant: "solid", shape: "regular" },
  render: (args) => (
    <div className="w-96 flex flex-col gap-8">
      <div>
        <Typography variant="body-small">Small (1px)</Typography>
        <Divider {...args} size="sm" />
      </div>
      <div>
        <Typography variant="body-small">Medium (2px)</Typography>
        <Divider {...args} size="md" />
      </div>
      <div>
        <Typography variant="body-small">Large (4px)</Typography>
        <Divider {...args} size="lg" />
      </div>
      <div>
        <Typography variant="body-small">Dashed Large</Typography>
        <Divider {...args} variant="dashed" size="lg" />
      </div>
    </div>
  ),
};

export const WithContent: Story = {
  name: "With Content",
  render: () => (
    <div className="w-96 flex flex-col gap-8">
      <Divider textAlign="center">OR</Divider>

      <Divider textAlign="start" color="secondary">
        <div className="flex items-center gap-2">
          <Mail size={14} /> <span>Messages</span>
        </div>
      </Divider>

      <Divider textAlign="center" shape="wavy" color="primary" size="md">
        <Sparkles size={16} />
      </Divider>

      <Divider textAlign="end" variant="dashed">
        Read More
      </Divider>
    </div>
  ),
};

export const VerticalWavy: Story = {
  name: "Vertical Orientation",
  render: () => (
    <Card className="h-40 flex items-center justify-center p-6 bg-surface-container-low border-none">
      <div className="flex h-full items-center gap-6">
        <div className="text-center">
          <Typography variant="display-medium" className="font-bold">
            24
          </Typography>
          <Typography variant="body-small" muted>
            Posts
          </Typography>
        </div>

        {/* Regular Vertical */}
        <Divider orientation="vertical" size="sm" className="h-16" />

        <div className="text-center">
          <Typography variant="display-medium" className="font-bold">
            12k
          </Typography>
          <Typography variant="body-small" muted>
            Followers
          </Typography>
        </div>

        {/* Wavy Vertical */}
        <Divider
          orientation="vertical"
          shape="wavy"
          color="secondary"
          waveSize="sm"
          className="h-20"
        />

        <div className="text-center">
          <Typography variant="display-medium" className="font-bold">
            50
          </Typography>
          <Typography variant="body-small" muted>
            Following
          </Typography>
        </div>
      </div>
    </Card>
  ),
};

export const CouponCutout: Story = {
  name: "Use Case: Coupon",
  render: () => (
    <div className="w-80 bg-surface-container shadow-md rounded-xl overflow-hidden relative">
      <div className="p-6 text-center bg-primary text-on-primary">
        <Typography variant="headline-medium" className="font-bold">
          50% OFF
        </Typography>
        <Typography variant="body-medium">Holiday Sale</Typography>
      </div>

      {/* Dashed divider acting as a cut line */}
      <div className="relative">
        <div className="absolute -left-3 -top-3 w-6 h-6 bg-background rounded-full" />
        <div className="absolute -right-3 -top-3 w-6 h-6 bg-background rounded-full" />
        <Divider
          variant="dashed"
          size="md"
          className="my-0 border-primary/30"
        />
      </div>

      <div className="p-4 flex items-center justify-center gap-2 text-on-surface-variant">
        <Scissors size={16} />
        <Typography variant="label-small">Cut here to redeem</Typography>
      </div>
    </div>
  ),
};
