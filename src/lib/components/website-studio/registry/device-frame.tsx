import React from "react";
import DeviceFrame from "../../device";
import type { RegistryComponent } from "../types";

export const DeviceFrameConfig: RegistryComponent = {
  name: "Device Frame",
  category: "Layout",
  acceptsChildren: true,
  render: ({ defaultType, children, ...props }) => {
    return (
      <div className="w-full flex justify-center py-8" {...props}>
        <DeviceFrame key={defaultType} defaultType={defaultType}>
          {children || (
            <div className="w-full h-full flex items-center justify-center bg-surface-container-lowest text-on-surface-variant/50 text-sm">
              Drop App Content Here
            </div>
          )}
        </DeviceFrame>
      </div>
    );
  },
  controls: {
    defaultType: {
      type: "select",
      label: "Device Type",
      group: "Layout",
      defaultValue: "phone",
      options: [
        { label: "Phone", value: "phone" },
        { label: "Tablet", value: "tablet" },
        { label: "Laptop", value: "laptop" },
      ],
    },
  },
};
