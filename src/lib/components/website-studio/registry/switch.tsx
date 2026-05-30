import React from "react";
import { Switch } from "../../switch";
import type { RegistryComponent } from "../types";

export const SwitchConfig: RegistryComponent = {
  name: "Switch",
  category: "Forms",
  render: ({ defaultChecked, ...props }) => (
    <Switch defaultChecked={defaultChecked} {...props} />
  ),
  controls: {
    label: {
      type: "text",
      label: "Label",
      defaultValue: "Enable Notifications",
      group: "Content",
      supportsCMS: true,
    },
    description: {
      type: "text",
      label: "Description",
      defaultValue: "Receive daily digest emails",
      group: "Content",
      supportsCMS: true,
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
    withIcons: {
      type: "boolean",
      label: "Show Check Icon (MD3)",
      group: "Aesthetics",
      defaultValue: true,
    },
    showUncheckedIcon: {
      type: "boolean",
      label: "Show 'X' Icon when off",
      group: "Aesthetics",
      defaultValue: false,
    },
    defaultChecked: {
      type: "boolean",
      label: "Checked by default",
      group: "State",
      defaultValue: false,
    },
    disabled: {
      type: "boolean",
      label: "Disabled",
      group: "State",
      defaultValue: false,
    },
  },
};
