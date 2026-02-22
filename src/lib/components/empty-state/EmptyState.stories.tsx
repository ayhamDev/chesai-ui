import type { Meta, StoryObj } from "@storybook/react";
import { FolderSearch, Inbox, SearchX } from "lucide-react";
import { Button } from "../button";
import { EmptyState } from "./index";

const meta: Meta<typeof EmptyState> = {
  title: "Components/Feedback/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: <Inbox />,
    title: "No messages yet",
    description: "When you receive a new message, it will show up here.",
    action: <Button variant="secondary">Refresh Inbox</Button>,
  },
  render: (args) => (
    <div className="w-[600px] h-[400px] flex items-center justify-center bg-graphite-background border border-dashed rounded-xl">
      <EmptyState {...args} />
    </div>
  ),
};

export const SearchNoResults: Story = {
  name: "Search No Results (Card Variant)",
  args: {
    variant: "card",
    icon: <SearchX />,
    title: "No results found",
    description:
      "We couldn't find anything matching your search. Try adjusting your filters.",
    action: <Button variant="outline">Clear Filters</Button>,
  },
  render: (args) => (
    <div className="w-[600px]">
      <EmptyState {...args} />
    </div>
  ),
};
