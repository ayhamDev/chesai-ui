import type { Meta, StoryObj } from "@storybook/react";
import {
  Clock,
  Menu,
  MoreVertical,
  Search,
  Star,
  TrendingUp,
  History,
  Plus,
} from "lucide-react";
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
          "A refined Material Design 3 Search View. It features a seamless shared-element transition from a docked 'pill' state to a full-screen (mobile) or modal (desktop) view.",
      },
    },
  },
  // We simulate a mobile device frame for the best preview
  decorators: [(Story) => <Story />],
};

export default meta;
type Story = StoryObj<typeof SearchView>;

// --- MOCK DATA ---
const HISTORY = [
  { id: 1, text: "Summer vacation plans", icon: <History size={20} /> },
  { id: 2, text: "Grocery list", icon: <History size={20} /> },
  { id: 3, text: "Budget 2025", icon: <History size={20} /> },
];

const SUGGESTIONS = [
  { id: 4, text: "Coffee shops nearby", icon: <Search size={20} /> },
  { id: 5, text: "Weather in Tokyo", icon: <Search size={20} /> },
  { id: 6, text: "How to center a div", icon: <TrendingUp size={20} /> },
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
  {
    id: 9,
    text: "Charlie Davis",
    sub: "charlie@example.com",
    avatar: "https://i.pravatar.cc/150?u=c",
  },
];

export const FullDemo: Story = {
  name: "Interactive Demo",
  render: () => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    // Simple search logic
    const isSearching = query.length > 0;

    // Filter results
    const filteredResults = RESULTS.filter((r) =>
      r.text.toLowerCase().includes(query.toLowerCase())
    );

    return (
      <div className="max-w-md mx-auto pt-10 relative">
        <div className="mb-6 px-2">
          <Typography variant="h2" className="font-normal text-3xl">
            Explore
          </Typography>
        </div>

        <SearchView
          value={query}
          onChange={setQuery}
          open={isOpen}
          onOpenChange={setIsOpen}
          placeholder="Search mail, people, and more..."
          // Match Image 1: Menu icon on left, Avatar on right
          dockedLeadingIcon={<Search className="h-6 w-6" />}
          dockedTrailingIcon={
            <Avatar
              src="https://i.pravatar.cc/150?u=8"
              size="sm"
              className="cursor-pointer hover:opacity-80"
            />
          }
        >
          <div className="py-2">
            {/* HISTORY SECTION */}
            {!isSearching && (
              <>
                <div className="px-4 py-3">
                  <Typography variant="small" className="font-bold opacity-70">
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
              </>
            )}

            {/* SUGGESTIONS SECTION */}
            {!isSearching && (
              <>
                <div className="px-4 py-3 mt-2">
                  <Typography variant="small" className="font-bold opacity-70">
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

            {/* RESULTS SECTION */}
            {isSearching && (
              <>
                <div className="px-4 py-3">
                  <Typography variant="small" className="font-bold opacity-70">
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
                        <Typography variant="muted" className="text-sm">
                          {item.sub}
                        </Typography>
                      </ItemContent>
                    </Item>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No results found for "{query}"
                  </div>
                )}
              </>
            )}
          </div>
        </SearchView>

        {/* Dummy Background Content */}
        <div className="mt-8 px-4 grid grid-cols-2 gap-4 opacity-30 pointer-events-none">
          <div className="h-40 rounded-2xl bg-blue-100 dark:bg-blue-900/30" />
          <div className="h-40 rounded-2xl bg-green-100 dark:bg-green-900/30" />
          <div className="h-40 rounded-2xl bg-purple-100 dark:bg-purple-900/30" />
          <div className="h-40 rounded-2xl bg-orange-100 dark:bg-orange-900/30" />
        </div>
      </div>
    );
  },
};
