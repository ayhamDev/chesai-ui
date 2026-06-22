import type { Meta, StoryObj } from "@storybook/react";
import { History, Menu, MoreVertical, Search } from "lucide-react";
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
          "A refined Material Design 3 Search View. Supports keyboard navigation (ArrowUp/ArrowDown to select, Enter to choose, and Tab focus locks).",
      },
    },
  },
  argTypes: {
    showOverlay: {
      control: "boolean",
      description:
        "Whether the dark background overlay displays in the expanded state.",
    },
    variant: {
      control: "select",
      options: ["modal", "docked", "fullscreen"],
      description: "How the search view expands on desktop.",
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description:
        "Sets the geometric boundary rounding on unexpanded and expanded elements.",
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
              Recent (Press Arrow Keys to Navigate)
            </Typography>
          </div>
          {HISTORY.map((item) => (
            <Item
              key={item.id}
              variant="ghost"
              role="button"
              tabIndex={0}
              className="cursor-pointer rounded-none px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5 outline-none focus:ring-1 focus:ring-primary"
              onClick={() => setQuery(item.text)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setQuery(item.text);
                }
              }}
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
              role="button"
              tabIndex={0}
              className="cursor-pointer rounded-none px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5 outline-none focus:ring-1 focus:ring-primary"
              onClick={() => setQuery(item.text)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setQuery(item.text);
                }
              }}
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
                role="button"
                tabIndex={0}
                className="cursor-pointer rounded-none px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5 outline-none focus:ring-1 focus:ring-primary"
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
  args: { variant: "modal", shape: "full" },
  render: (args) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="max-w-md mx-auto pt-10">
        <div className="mb-4 text-center text-sm text-gray-500">
          Open search, then press{" "}
          <kbd className="bg-gray-100 px-1 rounded">Tab</kbd> or{" "}
          <kbd className="bg-gray-100 px-1 rounded">Arrow Keys</kbd> to navigate
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

export const ShapeVariations: Story = {
  name: "2. Shape variations",
  render: () => {
    const [query1, setQuery1] = useState("");
    const [query2, setQuery2] = useState("");
    const [query3, setQuery3] = useState("");

    return (
      <div className="flex flex-col gap-6 max-w-md mx-auto pt-10">
        <div>
          <Typography variant="label-small" className="mb-2 block opacity-60">
            Full Shape (Pill Style)
          </Typography>
          <SearchView
            value={query1}
            onChange={setQuery1}
            shape="full"
            placeholder="Full shape..."
            dockedLeadingIcon={<Search className="h-5 w-5" />}
          >
            <SearchContent query={query1} setQuery={setQuery1} />
          </SearchView>
        </div>

        <div>
          <Typography variant="label-small" className="mb-2 block opacity-60">
            Minimal Shape (Rounded Corners)
          </Typography>
          <SearchView
            value={query2}
            onChange={setQuery2}
            shape="minimal"
            placeholder="Minimal shape..."
            dockedLeadingIcon={<Search className="h-5 w-5" />}
          >
            <SearchContent query={query2} setQuery={setQuery2} />
          </SearchView>
        </div>

        <div>
          <Typography variant="label-small" className="mb-2 block opacity-60">
            Sharp Shape (Square Corners)
          </Typography>
          <SearchView
            value={query3}
            onChange={setQuery3}
            shape="sharp"
            placeholder="Sharp shape..."
            dockedLeadingIcon={<Search className="h-5 w-5" />}
          >
            <SearchContent query={query3} setQuery={setQuery3} />
          </SearchView>
        </div>
      </div>
    );
  },
};

export const DockedVariant: Story = {
  name: "3. Docked (In-Place)",
  args: {
    variant: "docked",
    shape: "full",
    triggerVariant: "default"
  },
  render: (args) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="w-full max-w-2xl mx-auto pt-6 px-4">
        <div className="mb-4 text-center text-sm text-gray-500">
          Expands in place (Minimal shape dropdown)
        </div>
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

        <div className="mt-8 grid grid-cols-2 gap-4 opacity-30">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="h-32 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  },
};
