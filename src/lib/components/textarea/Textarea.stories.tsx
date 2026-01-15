import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./index";

const meta: Meta<typeof Textarea> = {
  title: "Components/Forms & Inputs/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["flat", "bordered", "underlined", "faded"],
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
    placeholder: "",
    minRows: 3,
    variant: "flat",
    labelPlacement: "inside"
  },
};

export const Variants: Story = {
  name: "Variants",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <Textarea
        label="Flat (Default)"
        variant="flat"
        placeholder="Filled no ring"
      />
      <Textarea
        label="Faded"
        variant="faded"
        placeholder="Background shift on focus"
      />
      <Textarea
        label="Bordered"
        variant="bordered"
        placeholder="Outline style"
      />
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
        variant="flat"
        placeholder="Rounded-2xl"
      />
      <Textarea
        label="Full"
        shape="full"
        variant="flat"
        placeholder="Rounded-3xl"
      />
      <Textarea
        label="Sharp"
        shape="sharp"
        variant="flat"
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
    variant: "flat",
    labelPlacement: "inside"
  },
};

export const WithDescriptionAndError: Story = {
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <Textarea
        label="Feedback"
        placeholder="Tell us what you think"
        description="Your feedback helps us improve."
      />
      <Textarea
        label="Bio"
        placeholder="Tell us about yourself"
        isInvalid
        errorMessage="Bio cannot be empty."
        defaultValue=""
      />
    </div>
  ),
};
