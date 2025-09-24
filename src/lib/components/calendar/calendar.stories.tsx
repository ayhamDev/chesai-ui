import type { Meta, StoryObj } from "@storybook/react";
import { addDays } from "date-fns";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { PaginatedCalendar } from "../date-picker/paginated-calendar"; // Adjust the import path as needed
import { Card } from "../card/index";
const meta: Meta<typeof PaginatedCalendar> = {
  title: "Components/PaginatedCalendar",
  component: PaginatedCalendar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A custom, paginated calendar component with day, month, and year views. It supports both single and range date selection and features swipe and click navigation.",
      },
    },
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["single", "range"],
      description:
        "Determines if a single date or a date range can be selected.",
    },
    value: {
      control: false,
      description: "The currently selected date or date range.",
    },
    onSelect: {
      control: false,
      description: "Callback function triggered when a date is selected.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof PaginatedCalendar>;

// --- STORIES ---

export const SingleDate: Story = {
  name: "1. Single Date Selection",
  args: {
    mode: "single",
  },
  render: function Render(args) {
    const [date, setDate] = useState<Date | DateRange | undefined>(new Date());

    return (
      <Card className="min-w-[320px]">
        <PaginatedCalendar
          {...args}
          value={date}
          onSelect={(newVal) => setDate(newVal)}
        />
      </Card>
    );
  },
};

export const DateRange: Story = {
  name: "2. Date Range Selection",
  args: {
    mode: "range",
  },
  parameters: {
    docs: {
      description: {
        story:
          "In range mode, the first click sets the start date, and the second click sets the end date. Clicking a new date after a range is complete will start a new selection.",
      },
    },
  },
  render: function Render(args) {
    const [range, setRange] = useState<Date | DateRange | undefined>({
      from: new Date(),
      to: addDays(new Date(), 7),
    });

    return (
      <Card className="min-w-[320px]">
        <PaginatedCalendar
          {...args}
          value={range}
          onSelect={(newVal) => setRange(newVal)}
        />
      </Card>
    );
  },
};

export const NoInitialValue: Story = {
  name: "3. No Initial Value",
  args: {
    mode: "single",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The calendar can also be initialized without a pre-selected date.",
      },
    },
  },
  render: function Render(args) {
    const [date, setDate] = useState<Date | DateRange | undefined>();

    return (
      <Card className="min-w-[320px]">
        <PaginatedCalendar
          {...args}
          value={date}
          onSelect={(newVal) => setDate(newVal)}
        />
      </Card>
    );
  },
};
