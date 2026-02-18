import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../button";
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
      options: ["flat", "bordered", "faded", "underlined"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    isInvalid: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    maxLength: {
      control: "number",
    },
    onComplete: { action: "completed" },
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A flexible OTP input component built on `input-otp`, fully integrated with the design system's variants and tokens.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof InputOTP>;

export const Default: Story = {
  name: "1. Default (Flat)",
  args: {
    maxLength: 6,
    variant: "flat",
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

export const Bordered: Story = {
  name: "2. Bordered Variant",
  args: {
    maxLength: 6,
    variant: "bordered",
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

export const ShapesAndSizes: Story = {
  name: "4. Shapes & Sizes",
  render: () => (
    <div className="flex flex-col gap-8 items-center">
      <div className="flex flex-col gap-2 items-center">
        <Typography variant="body-small">Small + Full Shape (Faded)</Typography>
        <InputOTP maxLength={4} size="sm" shape="full" variant="faded">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex flex-col gap-2 items-center">
        <Typography variant="body-small">
          Large + Sharp Shape (Bordered)
        </Typography>
        <InputOTP maxLength={4} size="lg" shape="sharp" variant="bordered">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </div>
  ),
};

export const ErrorState: Story = {
  name: "5. Error State",
  args: {
    maxLength: 6,
    isInvalid: true,
    value: "123",
    variant: "flat",
  },
  render: (args) => (
    <div className="flex flex-col gap-2 items-center">
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
      <Typography variant="body-small" className="text-error">
        Incorrect verification code.
      </Typography>
    </div>
  ),
};
