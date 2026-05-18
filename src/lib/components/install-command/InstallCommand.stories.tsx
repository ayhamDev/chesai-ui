import type { Meta, StoryObj } from "@storybook/react";
import { InstallCommand } from "./index";

const meta: Meta<typeof InstallCommand> = {
  title: "Components/Data/InstallCommand",
  component: InstallCommand,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    packageName: { control: "text" },
    isDevDependency: { control: "boolean" },
    variant: {
      control: "select",
      options: ["primary", "secondary", "surface", "ghost"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    shadow: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    packageName: "chesai-ui",
    variant: "primary",
    shape: "minimal",
    shadow: "none",
  },
  render: (args) => (
    <div className="w-[500px]">
      <InstallCommand {...args} />
    </div>
  ),
};

export const VisualVariants: Story = {
  name: "All Variants",
  render: () => (
    <div className="flex flex-col gap-6 w-[500px]">
      <InstallCommand packageName="react" variant="primary" />
      <InstallCommand packageName="framer-motion" variant="secondary" />
      <InstallCommand packageName="lucide-react" variant="surface" />
      <InstallCommand packageName="clsx" variant="ghost" />
    </div>
  ),
};

export const ShapesAndShadows: Story = {
  name: "Shapes & Shadows",
  render: () => (
    <div className="flex flex-col gap-6 w-[500px]">
      <InstallCommand
        packageName="zustand"
        shape="full"
        shadow="lg"
        variant="secondary"
      />
      <InstallCommand
        packageName="zod"
        shape="sharp"
        shadow="sm"
        variant="surface"
      />
    </div>
  ),
};
