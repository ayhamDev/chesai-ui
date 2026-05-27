// src/lib/components/command/command.stories.tsx
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
          "Fast, composable, unstyled command menu for React. Built on `cmdk` and styled with the Chesai MD3 theme system, now featuring custom glassmorphism options.",
      },
    },
  },
  argTypes: {
    glass: {
      control: "boolean",
      description: "Enables frosted glassmorphism behind the container.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Command>;

export const Standalone: Story = {
  name: "1. Standalone / Inline",
  args: {
    glass: false,
  },
  render: (args) => (
    <div className="w-[450px] shadow-lg rounded-2xl border border-outline-variant/30">
      <Command {...args}>
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
        <CommandFooter />
      </Command>
    </div>
  ),
};

export const StandaloneGlass: Story = {
  name: "2. Glassmorphic Standalone",
  args: {
    glass: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Standalone panel rendered with translucent glass on top of a vibrant gradient.",
      },
    },
  },
  render: (args) => (
    <div className="p-8 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl w-[500px] flex justify-center">
      <div className="w-full shadow-2xl">
        <Command {...args}>
          <CommandInput placeholder="Search on the glass..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Recent Actions">
              <CommandItem>
                <User className="mr-3 h-5 w-5 opacity-70" />
                <span>My Profile</span>
              </CommandItem>
              <CommandItem>
                <Settings className="mr-3 h-5 w-5 opacity-70" />
                <span>Preferences</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
          <CommandFooter />
        </Command>
      </div>
    </div>
  ),
};

export const DialogMode: Story = {
  name: "3. Dialog Mode (Spotlight)",
  args: {
    glass: true,
  },
  render: function Render(args) {
    const [open, setOpen] = useState(false);

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

        <CommandDialog open={open} onOpenChange={setOpen} glass={args.glass}>
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
          <CommandFooter />
        </CommandDialog>
      </div>
    );
  },
};
