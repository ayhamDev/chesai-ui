import React from "react";
import { BouncyBox } from "../../bouncy-box";
import type { RegistryComponent } from "../types";

export const BouncyBoxConfig: RegistryComponent = {
  name: "Bouncy Box",
  category: "Interactions",
  acceptsChildren: true,
  render: ({ children, scaleAmount, ...props }) => (
    <BouncyBox scaleAmount={scaleAmount} {...props}>
      {children || (
        <div className="px-6 py-4 border border-dashed border-outline-variant/50 rounded-xl bg-surface-container-lowest text-center">
          <span className="opacity-70 text-sm font-medium">Click me to bounce! Drop content here.</span>
        </div>
      )}
    </BouncyBox>
  ),
  controls: {
    scaleAmount: {
      type: "slider",
      label: "Scale Amount on Tap",
      description: "1.0 = No scale, 0.8 = Shrinks to 80%",
      group: "Physics",
      defaultValue: 0.95,
      min: 0.5,
      max: 1,
      step: 0.05,
    },
  },
};
