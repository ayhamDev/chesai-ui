import React from "react";
import { ButtonGroup } from "../../button-group";
import type { RegistryComponent } from "../types";

export const ButtonGroupConfig: RegistryComponent = {
  name: "Button Group",
  category: "Elements",
  acceptsChildren: true,
  render: ({ shape, children, ...props }) => {
    return (
      <div className="w-fit inline-block" {...props}>
        <ButtonGroup shape={shape}>
          {children || (
            <div className="p-2 border-2 border-dashed border-outline-variant/50 rounded-lg text-sm opacity-50">
              Drop Buttons Here
            </div>
          )}
        </ButtonGroup>
      </div>
    );
  },
  controls: {
    shape: {
      type: "select",
      label: "Group Outer Shape",
      group: "Aesthetics",
      defaultValue: "full",
      options: [
        { label: "Full (Pill Ends)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
  },
};
