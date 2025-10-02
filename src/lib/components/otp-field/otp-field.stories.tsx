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
    maxLength: {
      control: "number",
      description: "The total number of characters in the OTP input.",
    },
    onComplete: {
      action: "completed",
      description: "Callback fired when all slots are filled.",
    },
    disabled: {
      control: "boolean",
    },
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A flexible and accessible One-Time Password (OTP) input component, built on `input-otp` and styled for the chesai-ui theme.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof InputOTP>;

export const Default: Story = {
  name: "1. Default (6-Digit)",
  args: {
    maxLength: 6,
  },
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <div className="flex flex-col items-center gap-4">
        <Typography variant="h4">Enter Verification Code</Typography>
        {/* --- FIX: Explicitly pass props instead of spreading args --- */}
        <InputOTP
          maxLength={args.maxLength}
          disabled={args.disabled}
          value={value}
          onChange={setValue}
          onComplete={args.onComplete}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <Typography variant="muted">Current value: {value}</Typography>
      </div>
    );
  },
};

export const WithSeparator: Story = {
  name: "2. With Separator",
  args: {
    maxLength: 6,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use the `InputOTPSeparator` component to visually group digits.",
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col items-center gap-4">
      <Typography variant="h4">Enter Access Code</Typography>
      {/* --- FIX: Explicitly pass props instead of spreading args --- */}
      <InputOTP
        maxLength={args.maxLength}
        disabled={args.disabled}
        onComplete={args.onComplete}
      >
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
    </div>
  ),
};

export const ControlledWithOnComplete: Story = {
  name: "3. Controlled with onComplete",
  args: {
    maxLength: 4,
  },
  render: function Render(args) {
    const [value, setValue] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    const handleComplete = (completedValue: string) => {
      // Simulate an API call
      console.log("OTP Completed:", completedValue);
      setIsComplete(true);
      // Forward the action to Storybook's actions panel
      args.onComplete?.(completedValue);
    };

    const handleReset = () => {
      setValue("");
      setIsComplete(false);
    };

    return (
      <div className="flex flex-col items-center gap-4 w-80">
        <Typography variant="h4">Enter 4-Digit PIN</Typography>
        {/* --- FIX: Explicitly pass props instead of spreading args --- */}
        <InputOTP
          maxLength={args.maxLength}
          disabled={args.disabled}
          value={value}
          onChange={setValue}
          onComplete={handleComplete}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
        {isComplete ? (
          <Typography variant="p" className="text-green-600">
            Verification successful!
          </Typography>
        ) : (
          <Typography variant="muted">
            The onComplete event will fire when all digits are entered.
          </Typography>
        )}
        <Button variant="secondary" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </div>
    );
  },
};
