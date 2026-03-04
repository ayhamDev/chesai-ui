import type { Meta, StoryObj } from "@storybook/react";
import { Typography } from "../typography";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./index";

const meta: Meta<typeof InputOTP> = {
  title: "Components/Forms & Inputs/InputOTP",
  component: InputOTP,
  subcomponents: { InputOTPGroup, InputOTPSlot, InputOTPSeparator },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "filled", // mapped from flat
        "bordered", // wait, InputOTP uses separate mapping logic in its component
        // InputOTP needs its own update in src/lib/components/otp-field/index.tsx to match new variants
        // OR we map them here if we updated the component logic.
        // Assuming InputOTP was updated to use similar variant names:
        "filled",
        "filled-inverted",
        "outlined",
        "underlined",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    isInvalid: { control: "boolean" },
    disabled: { control: "boolean" },
    maxLength: { control: "number" },
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof InputOTP>;

export const Default: Story = {
  name: "1. Default (Filled)",
  args: {
    maxLength: 6,
    variant: "filled", // Was flat
    size: "md",
    shape: "minimal",
  },
  render: (args) => (
    <InputOTP {...args}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const Outlined: Story = {
  name: "2. Outlined Variant",
  args: {
    maxLength: 6,
    variant: "outlined", // Was bordered
    shape: "minimal",
  },
  render: (args) => (
    <InputOTP {...args}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const Underlined: Story = {
  name: "3. Underlined Variant",
  args: {
    maxLength: 4,
    variant: "underlined",
    size: "lg",
  },
  render: (args) => (
    <InputOTP {...args}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  ),
};
