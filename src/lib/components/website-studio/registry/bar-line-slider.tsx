import React from "react";
import * as Icons from "lucide-react";
import { BarLineSlider } from "../../slider/bar-line-slider";
import type { RegistryComponent } from "../types";

export const BarLineSliderConfig: RegistryComponent = {
  name: "Bar-Line Slider",
  category: "Forms",
  render: ({
    icon,
    thickness,
    lineSize,
    activeColor,
    inactiveColor,
    shape,
    disabled,
    orientation,
    ...props
  }) => {
    const IconComponent = icon ? (Icons as any)[icon] : null;

    return (
      <div className="w-full flex justify-center py-4 bg-black/5 dark:bg-white/5 p-4 rounded-xl" {...props}>
        <div className={orientation === "vertical" ? "h-64" : "w-full max-w-sm"}>
          <BarLineSlider
            defaultValue={[50]}
            icon={IconComponent ? <IconComponent size={20} className="text-black" /> : undefined}
            thickness={thickness}
            lineSize={lineSize}
            activeColor={activeColor}
            inactiveColor={inactiveColor}
            shape={shape}
            disabled={disabled}
            orientation={orientation}
          />
        </div>
      </div>
    );
  },
  controls: {
    icon: {
      type: "text",
      label: "Inner Icon (Lucide)",
      group: "Icons",
      defaultValue: "Sun",
    },
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
    thickness: {
      type: "text",
      label: "Thickness (Tailwind Class)",
      description: "e.g., h-12 (horizontal) or w-12 (vertical)",
      group: "Aesthetics",
      defaultValue: "h-12",
    },
    lineSize: {
      type: "text",
      label: "Inactive Line Size (Tailwind Class)",
      group: "Aesthetics",
      defaultValue: "h-1.5",
    },
    activeColor: {
      type: "text",
      label: "Active Color (Tailwind BG Class)",
      description: "e.g., bg-white, bg-primary",
      group: "Aesthetics",
      defaultValue: "bg-white",
    },
    inactiveColor: {
      type: "text",
      label: "Inactive Color (Tailwind BG Class)",
      group: "Aesthetics",
      defaultValue: "bg-white/20",
    },
    shape: {
      type: "select",
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "full",
      options: [
        { label: "Full (Pill)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    disabled: {
      type: "boolean",
      label: "Disabled State",
      group: "State",
      defaultValue: false,
    },
  },
};
