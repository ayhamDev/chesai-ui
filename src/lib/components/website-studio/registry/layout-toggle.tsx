import React from "react";
import { LayoutDirectionToggle } from "../../layout-toggle";
import type { RegistryComponent } from "../types";

export const LayoutDirectionToggleConfig: RegistryComponent = {
  name: "RTL / LTR Toggle",
  category: "Theme",
  render: (props) => (
    <div className="w-fit inline-block" {...props}>
      <LayoutDirectionToggle />
    </div>
  ),
  controls: {}, // Self-contained component that modifies global context
};
