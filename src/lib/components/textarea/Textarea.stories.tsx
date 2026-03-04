import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./index";

const meta: Meta<typeof Textarea> = {
  title: "Components/Forms & Inputs/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "filled",
        "filled-inverted",
        "outlined",
        "outlined-inverted",
        "underlined",
        "underlined-inverted",
        "ghost",
        "ghost-inverted",
      ],
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "error"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    labelPlacement: {
      control: "select",
      options: ["inside", "outside", "outside-left"],
    },
    minRows: { control: "number" },
    maxRows: { control: "number" },
    disabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    isClearable: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    label: "Description",
    placeholder: "Type something...",
    minRows: 3,
    variant: "filled",
    labelPlacement: "inside",
  },
};

export const Variants: Story = {
  name: "Variants",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <Textarea label="Filled" variant="filled" placeholder="Standard" />
      <Textarea
        label="Filled Inverted"
        variant="filled-inverted"
        placeholder="Lighter background"
      />
      <Textarea label="Outlined" variant="outlined" placeholder="Bordered" />
      <Textarea label="Ghost" variant="ghost" placeholder="Transparent" />
      <Textarea
        label="Underlined"
        variant="underlined"
        placeholder="Bottom border only"
      />
    </div>
  ),
};

export const Shapes: Story = {
  name: "Rounding Shapes",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <Textarea
        label="Minimal (Default)"
        shape="minimal"
        variant="filled"
        placeholder="Rounded-2xl"
      />
      <Textarea
        label="Full"
        shape="full"
        variant="filled"
        placeholder="Rounded-3xl"
      />
      <Textarea
        label="Sharp"
        shape="sharp"
        variant="filled"
        placeholder="Rounded-none"
      />
    </div>
  ),
};

export const AutoResize: Story = {
  name: "Auto Resize",
  args: {
    label: "Auto Resizing",
    placeholder: "Type many lines to see me grow...",
    minRows: 2,
    maxRows: 6,
    variant: "filled",
    labelPlacement: "inside",
  },
};
