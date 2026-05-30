import React from "react";
import * as Icons from "lucide-react";
import { Chip } from "../../chip";
import type { RegistryComponent } from "../types";

export const ChipConfig: RegistryComponent = {
  name: "Chip",
  category: "Elements",
  render: ({ label, selected, disabled, startIcon, endIcon, ...props }) => {
    const StartIconComponent = startIcon ? (Icons as any)[startIcon] : null;
    const EndIconComponent = endIcon ? (Icons as any)[endIcon] : null;

    return (
      <div className="w-fit inline-block" {...props}>
        <Chip
          selected={selected}
          disabled={disabled}
          startIcon={StartIconComponent ? <StartIconComponent size={14} /> : undefined}
          endIcon={EndIconComponent ? <EndIconComponent size={14} /> : undefined}
        >
          {label || "Chip"}
        </Chip>
      </div>
    );
  },
  controls: {
    label: {
      type: "text",
      label: "Label",
      defaultValue: "Filter",
      group: "Content",
      supportsCMS: true,
    },
    startIcon: {
      type: "text",
      label: "Start Icon (Lucide)",
      description: "e.g., Check, Star",
      group: "Icons",
    },
    endIcon: {
      type: "text",
      label: "End Icon (Lucide)",
      description: "e.g., X, ChevronRight",
      group: "Icons",
    },
    selected: {
      type: "boolean",
      label: "Selected State",
      group: "State",
      defaultValue: false,
    },
    disabled: {
      type: "boolean",
      label: "Disabled State",
      group: "State",
      defaultValue: false,
    },
  },
};
