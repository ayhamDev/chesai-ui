import React from "react";
import { Checkbox } from "../../checkbox";
import type { RegistryComponent } from "../types";

export const CheckboxConfig: RegistryComponent = {
  name: "Checkbox",
  category: "Forms",
  render: ({ defaultChecked, ...props }) => (
    <Checkbox defaultChecked={defaultChecked} {...props} />
  ),
  controls: {
    label: {
      type: "text",
      label: "Label",
      defaultValue: "Accept terms and conditions",
      group: "Content",
      supportsCMS: true,
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
