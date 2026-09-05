// src/lib/components/full-calendar/FullCalendar.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import React, { useState } from "react";
import { LayoutProvider } from "../../context/layout-context";
import { Input } from "../input";
import { toast } from "../toast";
import { CalendarEvent, FullCalendar } from "./index";

const meta: Meta<typeof FullCalendar> = {
  title: "Components/Data/FullCalendar",
  component: FullCalendar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    // The calendar reports its initial visible range on mount. Storybook 8+
    // requires callbacks invoked during rendering to be explicit spies.
    onDateRangeChange: fn(),
  },
  argTypes: {
    onEventClick: {
      description:
        "Called when an existing event is clicked. The details/edit popover remains enabled by default.",
    },
    onDateClick: {
      description:
        "Called when an empty date or time slot is clicked, before the create popover opens.",
    },
    onEventCreate: {
      description:
        "Called after the user saves a new event from the create popover.",
    },
    disableEventPopover: {
      description:
        "Disables only the built-in details/edit popover. onEventClick still fires.",
    },
    disableCreatePopover: {
      description:
        "Disables only the built-in create popover. onDateClick still fires.",
    },
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "high-contrast",
        "ghost",
        "surface",
        "surface-container-lowest",
        "surface-container-low",
        "surface-container",
        "surface-container-high",
        "surface-container-highest",
      ],
      description:
        "Controls the background and wrapper aesthetics for the calendar.",
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[100dvh] w-full bg-background p-0 sm:p-6 flex flex-col relative overflow-hidden">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FullCalendar>;

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const currentDay = today.getDate();

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: "eid",
    title: "Company Retreat",
    start: new Date(currentYear, currentMonth, 15),
    end: new Date(currentYear, currentMonth, 18),
    isAllDay: true,
    color: "#dbeafe",
  },
  {
    id: "meeting-1",
    title: "Design Sync",
    start: new Date(currentYear, currentMonth, currentDay, 10, 0),
    end: new Date(currentYear, currentMonth, currentDay, 11, 0),
    color: "#5b21b6",
  },
  {
    id: "recurring-standup",
    title: "Daily Standup",
    start: new Date(currentYear, currentMonth, currentDay, 9, 0),
    end: new Date(currentYear, currentMonth, currentDay, 9, 30),
    color: "#fbbf24",
    recurrence: {
      frequency: "daily",
      interval: 1,
      endType: "never",
    },
  },
];

const InteractiveCalendarApp = (args: any) => {
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const calendarRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <FullCalendar
        {...args} // Spread args first to prevent mock action spys from overriding custom state handlers
        ref={calendarRef}
        initialDate={today}
        initialView="week"
        events={events}
        className="shadow-2xl border border-outline-variant/30 flex-1"
        onEventCreate={(newEvent) => {
          setEvents((prev) => [...prev, newEvent]);
          toast.success("Event created successfully", {
            description: newEvent.title,
          });
        }}
        onEventUpdate={(updatedEvent) => {
          setEvents((prev) =>
            prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
          );
          toast.success("Event updated", { description: updatedEvent.title });
        }}
        onEventDelete={(id) => {
          setEvents((prev) => prev.filter((e) => e.id !== id));
          toast("Event deleted");
        }}
        renderPopoverCustomFields={(eventState, setEventState) => (
          <div className="flex flex-col gap-2">
            <Input
              variant="filled"
              size="sm"
              placeholder="Project Code..."
              value={eventState.data?.projectCode || ""}
              onChange={(e) =>
                setEventState({
                  data: { ...eventState.data, projectCode: e.target.value },
                })
              }
            />
          </div>
        )}
      >
        <FullCalendar.Toolbar />
        <FullCalendar.View />
      </FullCalendar>
    </>
  );
};

export const GoogleCalendarClone: Story = {
  name: "Google Calendar Clone",
  args: {
    variant: "primary",
    hidePopoverTitle: true
  },
  render: (args) => <InteractiveCalendarApp {...args} />,
};

export const Variants: Story = {
  name: "Visual Variants",
  args: {
    variant: "secondary",
  },
  render: (args) => <InteractiveCalendarApp {...args} />,
};

export const RtlWeekView: Story = {
  name: "RTL Week View",
  args: {
    variant: "primary",
    hidePopoverTitle: true,
  },
  render: (args) => (
    <LayoutProvider
      initialDirection="rtl"
      storageKey="full-calendar-rtl-story-direction"
    >
      <InteractiveCalendarApp {...args} />
    </LayoutProvider>
  ),
};

export const CustomEventClick: Story = {
  name: "Existing Event Click — Custom Handling",
  args: {
    variant: "primary",
    onEventClick: (event) => {
      toast(`Custom click: ${event.title}`, {
        description: "The built-in event popover stays closed.",
      });
    },
  },
  render: (args) => (
    <InteractiveCalendarApp {...args} disableEventPopover />
  ),
};

export const RecurringOccurrenceEditing: Story = {
  name: "Recurring Event — This or All",
  args: {
    variant: "primary",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Edit, move, resize, or delete a Daily Standup occurrence to choose between changing only that occurrence or the entire recurring series.",
      },
    },
  },
  render: (args) => <InteractiveCalendarApp {...args} />,
};
