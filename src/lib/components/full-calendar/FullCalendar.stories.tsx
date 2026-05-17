// src/lib/components/full-calendar/FullCalendar.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { FullCalendar, CalendarEvent } from "./index";
import { ThemeProvider } from "../../context/ThemeProvider";
import { FAB } from "../fab";
import { toast, Toaster } from "../toast";
import { Typography } from "../typography";
import { Input } from "../input";

const meta: Meta<typeof FullCalendar> = {
  title: "Components/Data/FullCalendar",
  component: FullCalendar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="system">
        <div className="h-[100dvh] w-full bg-background p-0 sm:p-6 flex flex-col relative overflow-hidden">
          <Toaster position="bottom-center" />
          <Story />
        </div>
      </ThemeProvider>
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
    colorVariant: "success",
  },
  {
    id: "meeting-1",
    title: "Design Sync",
    start: new Date(currentYear, currentMonth, currentDay, 10, 0),
    end: new Date(currentYear, currentMonth, currentDay, 11, 0),
    colorVariant: "primary",
  },
  {
    id: "recurring-standup",
    title: "Daily Standup",
    start: new Date(currentYear, currentMonth, currentDay, 9, 0),
    end: new Date(currentYear, currentMonth, currentDay, 9, 30),
    colorVariant: "indigo",
    recurrence: {
      frequency: "daily",
      interval: 1,
      endType: "never",
    },
  },
];

const InteractiveCalendarApp = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const calendarRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <FullCalendar
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

      <div className="absolute bottom-6 right-6 sm:bottom-12 sm:right-12 z-40 print:hidden">
        <FAB
          icon={<Plus />}
          size="lg"
          variant="primary"
          isExtended
          onClick={(e) => {
            toast.info("Click an empty space on the grid to create an event!");
          }}
        >
          Add Event
        </FAB>
      </div>
    </>
  );
};

export const GoogleCalendarClone: Story = {
  name: "Google Calendar Clone",
  render: () => <InteractiveCalendarApp />,
};
