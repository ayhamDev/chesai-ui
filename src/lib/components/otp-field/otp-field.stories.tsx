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
    separated: { control: "boolean" },
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

export const Separated: Story = {
  name: "4. Separated Slots",
  args: { maxLength: 6, variant: "filled", shape: "minimal", separated: true, size: "md" },
  render: args => (
    <InputOTP {...args}>
      <InputOTPGroup>
        {Array.from({ length: args.maxLength }, (_, index) => <InputOTPSlot key={index} index={index} />)}
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const SeparatedShapes: Story = {
  name: "5. Separated Shapes",
  render: () => (
    <div className="flex flex-col gap-6">
      {(["full", "minimal", "sharp"] as const).map(shape => (
        <div key={shape} className="flex flex-col gap-2">
          <Typography variant="label-medium">{shape}</Typography>
          <InputOTP maxLength={5} separated shape={shape} aria-label={`${shape} verification code`}>
            <InputOTPGroup>
              {Array.from({ length: 5 }, (_, index) => <InputOTPSlot key={index} index={index} />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
      ))}
    </div>
  ),
};
