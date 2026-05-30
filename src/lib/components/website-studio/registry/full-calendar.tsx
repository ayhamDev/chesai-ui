import React, { useRef } from "react";
import { FullCalendar } from "../../full-calendar";
import type { RegistryComponent } from "../types";

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();

const MOCK_EVENTS = [
  {
    id: "evt1",
    title: "Quarterly Planning",
    start: new Date(y, m, 12, 10, 0),
    end: new Date(y, m, 14, 16, 0),
    isAllDay: true,
    colorVariant: "primary",
  },
  {
    id: "evt2",
    title: "Design Sync",
    start: new Date(y, m, 15, 14, 0),
    end: new Date(y, m, 15, 15, 30),
    colorVariant: "secondary",
  },
  {
    id: "evt3",
    title: "Product Launch",
    start: new Date(y, m, 22, 9, 0),
    end: new Date(y, m, 22, 12, 0),
    colorVariant: "success",
  },
];

export const FullCalendarConfig: RegistryComponent = {
  name: "Full Calendar",
  category: "Data Display",
  render: ({ variant, initialView, ...props }) => {
    const calendarRef = useRef<HTMLDivElement>(null);

    return (
      <div className="w-full h-[600px] flex flex-col border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden" {...props}>
        <FullCalendar
          ref={calendarRef}
          events={MOCK_EVENTS as any}
          initialView={initialView}
          variant={variant}
          className="flex-1"
        >
          <FullCalendar.Toolbar />
          <FullCalendar.View />
        </FullCalendar>
      </div>
    );
  },
  controls: {
    initialView: {
      type: "select",
      label: "Default View",
      group: "Layout",
      defaultValue: "month",
      options: [
        { label: "Month", value: "month" },
        { label: "Week", value: "week" },
        { label: "Day", value: "day" },
        { label: "Year", value: "year" },
      ],
    },
    variant: {
      type: "select",
      label: "Background Variant",
      group: "Aesthetics",
      defaultValue: "surface",
      options: [
        { label: "Surface (Base)", value: "surface" },
        { label: "Primary Container", value: "primary" },
        { label: "Secondary Container", value: "secondary" },
        { label: "Ghost (Transparent)", value: "ghost" },
      ],
    },
  },
};
