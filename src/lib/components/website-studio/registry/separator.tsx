import React from "react";
import { Separator } from "../../separator";
import type { RegistryComponent } from "../types";

export const SeparatorConfig: RegistryComponent = {
  name: "Separator (Basic)",
  category: "Layout",
  render: ({ orientation, ...props }) => (
    <div
      className={`flex items-center justify-center bg-black/5 dark:bg-white/5 border border-dashed border-outline-variant/30 rounded-lg ${orientation === 'horizontal' ? 'w-full h-12' : 'h-32 w-12 mx-auto'}`}
      {...props}
    >
      <Separator orientation={orientation} className={orientation === 'vertical' ? 'h-24' : 'w-3/4'} />
    </div>
  ),
  controls: {
    orientation: {
      type: "select",
      label: "Orientation",
      group: "Layout",
      defaultValue: "horizontal",
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical", value: "vertical" },
      ],
    },
  },
};
