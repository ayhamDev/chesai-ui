import React from "react";
import { Shape } from "../../shape";
import { SHAPE_PATHS } from "../../shape/paths";
import type { RegistryComponent } from "../types";

export const ShapeConfig: RegistryComponent = {
  name: "Morphing Shape (SVG)",
  category: "Media",
  render: ({ shape, color, size, duration, ...props }) => (
    <div className="flex justify-center items-center w-full" {...props}>
      <Shape
        shape={shape || "circle"}
        duration={duration}
        style={{ width: size, height: size, color: color || "currentColor" }}
      />
    </div>
  ),
  controls: {
    shape: {
      type: "select",
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "circle",
      options: Object.keys(SHAPE_PATHS).map((s) => ({
        label: s.charAt(0).toUpperCase() + s.slice(1),
        value: s,
      })),
    },
    color: {
      type: "color",
      label: "Fill Color",
      group: "Aesthetics",
      defaultValue: "var(--md-sys-color-primary)",
      supportsCMS: true,
    },
    size: {
      type: "number",
      label: "Size (px)",
      group: "Layout",
      defaultValue: 150,
      min: 24,
      max: 800,
    },
    duration: {
      type: "slider",
      label: "Morph Duration (seconds)",
      group: "Behavior",
      defaultValue: 0.8,
      min: 0,
      max: 3,
      step: 0.1,
    },
  },
};
