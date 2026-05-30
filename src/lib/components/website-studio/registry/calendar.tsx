import React, { useState } from "react";
import { Calendar } from "../../date-picker/calendar";
import type { RegistryComponent } from "../types";

export const StandaloneCalendarConfig: RegistryComponent = {
  name: "Standalone Calendar",
  category: "Forms",
  render: ({ variant, shape, itemShape, mode, ...props }) => {
    // Maintain internal state so the user can click around in the builder
    const [date, setDate] = useState<Date>(new Date());
    const [range, setRange] = useState<any>({});

    return (
      <div className="w-fit" {...props}>
        <Calendar 
          variant={variant} 
          shape={shape} 
          itemShape={itemShape} 
          mode={mode}
          value={mode === 'range' ? range : date}
          onSelect={setDate}
          onRangeSelect={setRange}
        />
      </div>
    );
  },
  controls: {
    mode: {
      type: "select",
      label: "Selection Mode",
      group: "Behavior",
      defaultValue: "single",
      options: [
        { label: "Single Date", value: "single" },
        { label: "Date Range", value: "range" },
      ],
    },
    variant: {
      type: "select",
      label: "Container Variant",
      group: "Aesthetics",
      defaultValue: "default",
      options: [
        { label: "Default (Card with Shadow)", value: "default" },
        { label: "Embedded (Flat/Transparent)", value: "embedded" },
      ],
    },
    shape: {
      type: "select",
      label: "Container Shape",
      group: "Aesthetics",
      defaultValue: "full",
      options: [
        { label: "Full (Heavy Round)", value: "full" },
        { label: "Minimal (Standard)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    itemShape: {
      type: "select",
      label: "Day Button Shape",
      group: "Aesthetics",
      defaultValue: "full",
      options: [
        { label: "Circle", value: "full" },
        { label: "Rounded", value: "minimal" },
        { label: "Square", value: "sharp" },
      ],
    },
  },
};
