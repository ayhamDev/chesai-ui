import React from "react";
import { Skeleton } from "../../skeleton";
import type { RegistryComponent } from "../types";

export const SkeletonConfig: RegistryComponent = {
  name: "Skeleton Placeholder",
  category: "Feedback",
  render: ({ width, height, shape, ...props }) => (
    <div className="w-fit" {...props}>
      <Skeleton
        style={{ width, height }}
        className={
          shape === "full"
            ? "rounded-full"
            : shape === "minimal"
            ? "rounded-xl"
            : "rounded-none"
        }
      />
    </div>
  ),
  controls: {
    width: {
      type: "text",
      label: "Width (px or %)",
      group: "Layout",
      defaultValue: "100%",
    },
    height: {
      type: "text",
      label: "Height (px)",
      group: "Layout",
      defaultValue: "20px",
    },
    shape: {
      type: "select",
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Pill / Circle)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
  },
};
