import type { Meta, StoryObj } from "@storybook/react";
import { History, Menu, MoreVertical, Search, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Avatar } from "../avatar";
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "../item";
import { Typography } from "../typography";
import { SearchView } from "./index";

const meta: Meta<typeof SearchView> = {
  title: "Components/Navigators/SearchView",
  component: SearchView,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A refined Material Design 3 Search View. Features Modal, Fullscreen, and Docked expansion modes.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["modal", "docked", "fullscreen"],
      description: "How the search view expands on desktop.",
    },
  },
  decorators: [(Story) => <Story />],
};

export default meta;
type Story = StoryObj<typeof SearchView>;

// --- MOCK DATA ---
const HISTORY = [
  { id: 1, text: "Summer vacation plans", icon: <History size={20} /> },
  { id: 2, text: "Grocery list", icon: <History size={20} /> },
];

const SUGGESTIONS = [
  { id: 4, text: "Coffee shops nearby", icon: <Search size={20} /> },
  { id: 5, text: "Weather in Tokyo", icon: <Search size={20} /> },
];

const RESULTS = [
  {
    id: 7,
    text: "Alice Freeman",
    sub: "alice@example.com",
    avatar: "https://i.pravatar.cc/150?u=a",
  },
  {
    id: 8,
    text: "Bob Smith",
    sub: "bob@example.com",
    avatar: "https://i.pravatar.cc/150?u=b",
  },
];

// Reusable content component for the stories
const SearchContent = ({ query, setQuery }: any) => {
  const isSearching = query.length > 0;
  const filteredResults = RESULTS.filter((r) =>
    r.text.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="py-2">
      {!isSearching && (
        <>
          <div className="px-4 py-3">
            <Typography variant="body-small" className="font-bold opacity-70">
              Recent
            </Typography>
          </div>
          {HISTORY.map((item) => (
            <Item
              key={item.id}
              variant="ghost"
              className="cursor-pointer rounded-none px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5"
              onClick={() => setQuery(item.text)}
            >
              <ItemMedia className="text-graphite-foreground/70 mr-4">
                {item.icon}
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="font-normal text-base">
                  {item.text}
                </ItemTitle>
              </ItemContent>
              <ItemActions>
                <div className="-rotate-45 opacity-40">
                  <MoreVertical size={18} />
                </div>
              </ItemActions>
            </Item>
          ))}
          <div className="px-4 py-3 mt-2">
            <Typography variant="body-small" className="font-bold opacity-70">
              Suggestions
            </Typography>
          </div>
          {SUGGESTIONS.map((item) => (
            <Item
              key={item.id}
              variant="ghost"
              className="cursor-pointer rounded-none px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5"
              onClick={() => setQuery(item.text)}
            >
              <ItemMedia className="text-graphite-foreground/70 mr-4">
                {item.icon}
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="font-normal text-base">
                  {item.text}
                </ItemTitle>
              </ItemContent>
            </Item>
          ))}
        </>
      )}

      {isSearching && (
        <>
          <div className="px-4 py-3">
            <Typography variant="body-small" className="font-bold opacity-70">
              Contacts
            </Typography>
          </div>
          {filteredResults.length > 0 ? (
            filteredResults.map((item) => (
              <Item
                key={item.id}
                variant="ghost"
                className="cursor-pointer rounded-none px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <ItemMedia className="mr-4">
                  <Avatar src={item.avatar} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="font-normal text-base">
                    {item.text}
                  </ItemTitle>
                  <Typography
                    variant="body-small"
                    muted={true}
                    className="text-sm"
                  >
                    {item.sub}
                  </Typography>
                </ItemContent>
              </Item>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No results found.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const ModalVariant: Story = {
  name: "1. Modal (Centered)",
  args: { variant: "modal" },
  render: (args) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="max-w-md mx-auto pt-10">
        <div className="mb-4 text-center text-sm text-gray-500">
          Expands to center screen (Desktop default)
        </div>
        <SearchView
          {...args}
          value={query}
          onChange={setQuery}
          open={isOpen}
          onOpenChange={setIsOpen}
          dockedLeadingIcon={<Menu className="h-6 w-6" />}
          dockedTrailingIcon={
            <Avatar src="https://i.pravatar.cc/150?u=8" size="sm" />
          }
        >
          <SearchContent query={query} setQuery={setQuery} />
        </SearchView>
      </div>
    );
  },
};

export const DockedVariant: Story = {
  name: "2. Docked (In-Place)",
  args: { variant: "docked" },
  parameters: {
    docs: {
      description: {
        story:
          "The docked variant expands directly downwards from the trigger bar, maintaining the trigger's width. This is common in apps where the search bar is part of a persistent top rail.",
      },
    },
  },
  render: (args) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="w-full max-w-2xl mx-auto pt-6 px-4">
        <div className="mb-4 text-center text-sm text-gray-500">
          Expands in place (Like a dropdown)
        </div>
        {/* Simulating a header bar container */}
        <div className="bg-surface-container rounded-xl p-2">
          <SearchView
            {...args}
            value={query}
            onChange={setQuery}
            open={isOpen}
            onOpenChange={setIsOpen}
            dockedLeadingIcon={<Search className="h-6 w-6" />}
            dockedTrailingIcon={
              <Avatar src="https://i.pravatar.cc/150?u=8" size="sm" />
            }
          >
            <SearchContent query={query} setQuery={setQuery} />
          </SearchView>
        </div>

        {/* Background content */}
        <div className="mt-8 grid grid-cols-2 gap-4 opacity-30">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="h-32 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  },
};

export const FullscreenVariant: Story = {
  name: "3. Fullscreen (Mobile)",
  args: { variant: "fullscreen" },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: (args) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="w-full h-screen bg-white dark:bg-black p-4">
        <div className="mb-4 text-center text-sm text-gray-500">
          Always fullscreen on mobile viewports
        </div>
        <SearchView
          {...args}
          value={query}
          onChange={setQuery}
          open={isOpen}
          onOpenChange={setIsOpen}
          dockedLeadingIcon={<Menu className="h-6 w-6" />}
          dockedTrailingIcon={
            <Avatar src="https://i.pravatar.cc/150?u=8" size="sm" />
          }
        >
          <SearchContent query={query} setQuery={setQuery} />
        </SearchView>
      </div>
    );
  },
};
