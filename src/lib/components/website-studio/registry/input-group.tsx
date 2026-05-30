import React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupInput
} from "../../input-group";
import type { RegistryComponent } from "../types";

export const InputGroupConfig: RegistryComponent = {
  name: "Input Group (Addons)",
  category: "Forms",
  render: ({ prefix, suffix, placeholder, variant, size, shape, isInvalid, disabled, ...props }) => (
    <div className="w-full" {...props}>
      <InputGroup>
        {prefix && (
          <InputGroupAddon align="start">
            <InputGroupText>{prefix}</InputGroupText>
          </InputGroupAddon>
        )}
        <InputGroupInput
          placeholder={placeholder}
          variant={variant}
          size={size}
          shape={shape}
          isInvalid={isInvalid}
          disabled={disabled}
          classNames={{
            input: `transition-all ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''}`
          }}
        />
        {suffix && (
          <InputGroupAddon align="end">
            <InputGroupText>{suffix}</InputGroupText>
          </InputGroupAddon>
        )}
      </InputGroup>
    </div>
  ),
  controls: {
    placeholder: {
      type: "text",
      label: "Placeholder",
      group: "Content",
      defaultValue: "example",
    },
    prefix: {
      type: "text",
      label: "Prefix Text",
      group: "Content",
      defaultValue: "https://",
    },
    suffix: {
      type: "text",
      label: "Suffix Text",
      group: "Content",
      defaultValue: ".com",
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
        { label: "Full (Pill)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    isInvalid: {
      type: "boolean",
      label: "Invalid State",
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
