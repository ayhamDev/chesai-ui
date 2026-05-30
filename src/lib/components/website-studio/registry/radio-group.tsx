import React, { useState } from "react";
import { Radio } from "../../radio-group";
import type { RegistryComponent } from "../types";

export const RadioGroupConfig: RegistryComponent = {
  name: "Radio Group",
  category: "Forms",
  render: ({ optionsString, label, disabled, layoutDirection, ...props }) => {
    const [val, setVal] = useState("");

    const parsedOptions = (optionsString || "")
      .split(",")
      .map((opt: string) => {
        const clean = opt.trim();
        return { label: clean, value: clean.toLowerCase().replace(/\s+/g, "-") };
      })
      .filter((opt: { label: string; value: string }) => opt.label !== "");

    return (
      <div className="w-full" {...props}>
        <Radio
          label={label}
          disabled={disabled}
          value={val}
          onValueChange={setVal}
          className={layoutDirection === "horizontal" ? "flex-row gap-6" : "flex-col gap-3"}
        >
          {parsedOptions.map((opt: any) => (
            <Radio.Item key={opt.value} value={opt.value} label={opt.label} />
          ))}
        </Radio>
      </div>
    );
  },
  controls: {
    label: {
      type: "text",
      label: "Group Label",
      defaultValue: "Select a Plan",
      group: "Content",
      supportsCMS: true,
    },
    optionsString: {
      type: "textarea",
      label: "Options (Comma Separated)",
      defaultValue: "Basic, Premium, Enterprise",
      group: "Data",
    },
    layoutDirection: {
      type: "select",
      label: "Layout Direction",
      group: "Layout",
      defaultValue: "vertical",
      options: [
        { label: "Vertical", value: "vertical" },
        { label: "Horizontal", value: "horizontal" },
      ],
    },
    disabled: {
      type: "boolean",
      label: "Disabled",
      group: "State",
      defaultValue: false,
    },
  },
};
