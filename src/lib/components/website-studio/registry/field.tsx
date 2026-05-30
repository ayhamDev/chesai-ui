import React from "react";
import { Field, FieldLabel, FieldDescription, FieldError } from "../../field";
import { Input } from "../../input";
import type { RegistryComponent } from "../types";

export const FieldConfig: RegistryComponent = {
  name: "Form Field Wrapper",
  category: "Forms",
  acceptsChildren: true,
  render: ({ label, description, isInvalid, errorMessage, orientation, children, ...props }) => (
    <div className="w-full" {...props}>
      <Field orientation={orientation} data-invalid={isInvalid}>
        {label && <FieldLabel>{label}</FieldLabel>}
        
        <div className="w-full">
          {children || (
            <Input 
              placeholder="Drop an input component here..." 
              isInvalid={isInvalid} 
              variant="filled"
              className="pointer-events-none" 
            />
          )}
        </div>

        {isInvalid && errorMessage ? (
          <FieldError>{errorMessage}</FieldError>
        ) : description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}
      </Field>
    </div>
  ),
  controls: {
    label: {
      type: "text",
      label: "Field Label",
      group: "Content",
      defaultValue: "Email Address",
      supportsCMS: true,
    },
    description: {
      type: "text",
      label: "Helper Description",
      group: "Content",
      defaultValue: "We'll never share your email with anyone else.",
      supportsCMS: true,
    },
    orientation: {
      type: "select",
      label: "Label Orientation",
      group: "Layout",
      defaultValue: "vertical",
      options: [
        { label: "Vertical (Top Label)", value: "vertical" },
        { label: "Horizontal (Side Label)", value: "horizontal" },
      ],
    },
    isInvalid: {
      type: "boolean",
      label: "Invalid State (Error)",
      group: "State",
      defaultValue: false,
    },
    errorMessage: {
      type: "text",
      label: "Error Message",
      group: "State",
      hidden: (props) => !props.isInvalid,
      defaultValue: "Please enter a valid email.",
    },
  },
};
