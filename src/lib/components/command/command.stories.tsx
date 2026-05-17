// src/lib/components/command/Command.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  Command as CommandIcon,
  Laptop,
  ChevronUp,
  ChevronDown,
  CornerDownLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../button";
import { Kbd } from "../kbd";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  CommandFooter,
} from "./index";

const meta: Meta<typeof Command> = {
  title: "Components/Data/Command",
  component: Command,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Fast, composable, unstyled command menu for React. Built on `cmdk` and styled with the Chesai MD3 theme system.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Command>;

// --- Common Footer Component for Reusability ---
const NavigationHints = () => (
  <CommandFooter>
    <div className="flex items-center gap-1.5 font-medium">
      <span className="flex items-center gap-0.5">
        <ChevronUp className="w-3.5 h-3.5" />
        <ChevronDown className="w-3.5 h-3.5" />
      </span>
      <span>to navigate</span>
    </div>
    <div className="flex items-center gap-1.5 font-medium">
      <CornerDownLeft className="w-3.5 h-3.5" />
      <span>to select</span>
    </div>
    <div className="flex items-center gap-1.5 ml-auto font-medium">
      <span className="text-[10px] font-mono border border-on-surface-variant/30 px-1 rounded-sm">
        ESC
      </span>
      <span>to close</span>
    </div>
  </CommandFooter>
);

// --- 1. Standalone Command Palette ---
export const Standalone: Story = {
  name: "1. Standalone / Inline",
  render: () => (
    <div className="w-[450px] shadow-lg rounded-2xl border border-outline-variant/30">
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Calendar className="mr-3 h-5 w-5 opacity-70" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <Smile className="mr-3 h-5 w-5 opacity-70" />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem disabled>
              <Calculator className="mr-3 h-5 w-5 opacity-70" />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="mr-3 h-5 w-5 opacity-70" />
              <span>Profile</span>
              <CommandShortcut>
                <Kbd size="sm">⌘</Kbd> <Kbd size="sm">P</Kbd>
              </CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard className="mr-3 h-5 w-5 opacity-70" />
              <span>Billing</span>
              <CommandShortcut>
                <Kbd size="sm">⌘</Kbd> <Kbd size="sm">B</Kbd>
              </CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-3 h-5 w-5 opacity-70" />
              <span>Settings</span>
              <CommandShortcut>
                <Kbd size="sm">⌘</Kbd> <Kbd size="sm">S</Kbd>
              </CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
        {/* Added Navigation Hints Footer */}
        <NavigationHints />
      </Command>
    </div>
  ),
};

// --- 2. Dialog Command Palette (Spotlight) ---
export const DialogMode: Story = {
  name: "2. Dialog Mode (Spotlight)",
  parameters: {
    docs: {
      description: {
        story:
          "Wraps the Command component in a `Dialog` to act as an application-wide quick actions menu (like MacOS Spotlight or Raycast). Try pressing `Cmd+J` or `Ctrl+J`.",
      },
    },
  },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(false);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setOpen((open) => !open);
        }
      };

      document.addEventListener("keydown", down);
      return () => document.removeEventListener("keydown", down);
    }, []);

    return (
      <div className="flex flex-col items-center gap-6 p-12">
        <p className="text-sm text-on-surface-variant text-center max-w-sm">
          Press{" "}
          <span className="inline-flex gap-1 mx-1">
            <Kbd size="sm">⌘</Kbd> <Kbd size="sm">J</Kbd>
          </span>{" "}
          or click the button below to open the command menu.
        </p>

        <Button
          variant="secondary"
          onClick={() => setOpen(true)}
          startIcon={<Search className="w-4 h-4" />}
        >
          Search Documentation...
        </Button>

        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="General">
              <CommandItem onSelect={() => setOpen(false)}>
                <Laptop className="mr-3 h-5 w-5 opacity-70" />
                <span>Theme Preferences</span>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>
                <CommandIcon className="mr-3 h-5 w-5 opacity-70" />
                <span>Keyboard Shortcuts</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => setOpen(false)}>
                <span>Go to Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>
                <span>Go to Projects</span>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>
                <span>Go to Settings</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
          {/* Added Navigation Hints Footer */}
          <NavigationHints />
        </CommandDialog>
      </div>
    );
  },
};
