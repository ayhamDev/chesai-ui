import React from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../../otp-field";
import type { RegistryComponent } from "../types";

export const OTPFieldConfig: RegistryComponent = {
  name: "OTP Field",
  category: "Forms",
  render: ({ maxLength, variant, size, shape, isInvalid, disabled, separateGroups, ...props }) => {
    const length = Math.max(1, Math.min(10, maxLength || 6));

    const renderSlots = (start: number, end: number) => {
      const slots = [];
      for (let i = start; i < end; i++) {
        slots.push(<InputOTPSlot key={i} index={i} />);
      }
      return slots;
    };

    return (
      <div className="w-full flex justify-center" {...props}>
        <InputOTP
          maxLength={length}
          variant={variant}
          size={size}
          shape={shape}
          isInvalid={isInvalid}
          disabled={disabled}
        >
          {separateGroups && length >= 4 ? (
            <>
              <InputOTPGroup>{renderSlots(0, Math.floor(length / 2))}</InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>{renderSlots(Math.floor(length / 2), length)}</InputOTPGroup>
            </>
          ) : (
            <InputOTPGroup>{renderSlots(0, length)}</InputOTPGroup>
          )}
        </InputOTP>
      </div>
    );
  },
  controls: {
    maxLength: {
      type: "number",
      label: "Number of Digits",
      group: "Data",
      defaultValue: 6,
      min: 2,
      max: 10,
    },
    separateGroups: {
      type: "boolean",
      label: "Split into two groups (with separator)",
      group: "Layout",
      defaultValue: true,
    },
    variant: {
      type: "select",
      label: "Variant",
      group: "Aesthetics",
      defaultValue: "filled",
      options: [
        { label: "Filled", value: "filled" },
        { label: "Outlined", value: "outlined" },
        { label: "Underlined", value: "underlined" },
        { label: "Ghost", value: "ghost" },
        { label: "Faded", value: "faded" },
      ],
    },
    size: {
      type: "select",
      label: "Size",
      group: "Aesthetics",
      defaultValue: "md",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    shape: {
      type: "select",
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Pill Ends)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    isInvalid: {
      type: "boolean",
      label: "Invalid State (Error)",
      group: "State",
      defaultValue: false,
    },
    disabled: {
      type: "boolean",
      label: "Disabled State",
      group: "State",
      defaultValue: false,
    },
  },
};
