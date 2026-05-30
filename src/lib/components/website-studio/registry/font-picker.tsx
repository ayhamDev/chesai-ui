import React from "react";
import { FontPicker } from "../../theme-controls/FontPicker";
import type { RegistryComponent } from "../types";

export const FontPickerConfig: RegistryComponent = {
  name: "Font Picker Widget",
  category: "Theme",
  render: (props) => (
    <div className="w-fit inline-block" {...props}>
      <FontPicker />
    </div>
  ),
  controls: {}, // Self-contained component that modifies global context
};
