import React, { useState } from "react";
import { InfiniteCalendar } from "../../date-picker/infinite-calendar";
import type { RegistryComponent } from "../types";

export const InfiniteCalendarConfig: RegistryComponent = {
  name: "Infinite Calendar",
  category: "Forms",
  render: ({ mode, ...props }) => {
    const [date, setDate] = useState<Date>(new Date());
    const [range, setRange] = useState<any>({});

    return (
      <div className="w-full max-w-sm h-[500px] border border-outline-variant/50 rounded-2xl overflow-hidden shadow-md" {...props}>
        <InfiniteCalendar 
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
  },
};
