import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowLeft,
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react";
import * as React from "react";
import { Button } from "../button";
import { DialogClose } from "../dialog";
import { IconButton } from "../icon-button";
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
} from "./index";

const meta: Meta<typeof Command> = {
  title: "Components/Command",
  component: Command,
  subcomponents: {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A fast, composable command menu. Built on `cmdk` and styled for the chesai-ui theme. Can be used inline or within a dialog.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Command>;

interface CommandItemType {
  value: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  shortcut?: string;
}

interface CommandGroupType {
  group: string;
  items: CommandItemType[];
}

const commandItems: CommandGroupType[] = [
  {
    group: "Suggestions",
    items: [
      {
        value: "calendar",
        label: "Calendar",
        icon: <Calendar className="mr-2 h-4 w-4" />,
      },
      {
        value: "emoji",
        label: "Search Emoji",
        icon: <Smile className="mr-2 h-4 w-4" />,
      },
      {
        value: "calculator",
        label: "Calculator",
        icon: <Calculator className="mr-2 h-4 w-4" />,
        disabled: true,
      },
    ],
  },
  {
    group: "Settings",
    items: [
      {
        value: "profile",
        label: "Profile",
        icon: <User className="mr-2 h-4 w-4" />,
        shortcut: "⌘P",
      },
      {
        value: "billing",
        label: "Billing",
        icon: <CreditCard className="mr-2 h-4 w-4" />,
        shortcut: "⌘B",
      },
      {
        value: "settings",
        label: "Settings",
        icon: <Settings className="mr-2 h-4 w-4" />,
        shortcut: "⌘S",
      },
    ],
  },
];

export const Default: Story = {
  name: "1. Inline Usage",
  render: (args) => (
    <Command
      {...args}
      className="max-w-lg rounded-lg border border-graphite-border shadow-md"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {commandItems.map((group) => (
          <CommandGroup key={group.group} heading={group.group}>
            {group.items.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                onSelect={() => alert(`Selected: ${item.label}`)}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.shortcut && (
                  <CommandShortcut>{item.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  ),
};

export const DialogDesktop: Story = {
  name: "2. Dialog (Desktop)",
  parameters: {
    layout: "fullscreen",
  },
  render: () => {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setOpen((open) => !open);
        }
      };
      document.addEventListener("keydown", down);
      return () => document.removeEventListener("keydown", down);
    }, []);

    return (
      <div className="flex h-screen w-full items-center justify-center bg-graphite-background p-0">
        <p className="text-sm text-graphite-foreground/70">
          Press{" "}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-graphite-card px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>{" "}
          to open.
        </p>
        <CommandDialog open={open} onOpenChange={setOpen}>
          {/* --- FIX: Keep CommandInput and CommandList as direct children of Command --- */}
          <Command>
            <div className="flex items-center border-b border-graphite-border">
              <DialogClose asChild>
                <IconButton variant="ghost" className="m-1">
                  <ArrowLeft />
                </IconButton>
              </DialogClose>
              <CommandInput placeholder="Type a command or search..." />
            </div>
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {commandItems.map((group) => (
                <CommandGroup key={group.group} heading={group.group}>
                  {group.items.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      disabled={item.disabled}
                      onSelect={() => setOpen(false)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <CommandShortcut>{item.shortcut}</CommandShortcut>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
          {/* --- END FIX --- */}
        </CommandDialog>
      </div>
    );
  },
};

export const DialogMobile: Story = {
  name: "3. Dialog (Mobile)",
  parameters: {
    ...DialogDesktop.parameters,
    viewport: { defaultViewport: "mobile1" },
  },
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="flex h-screen w-full items-center justify-center bg-graphite-background p-0">
        <Button onClick={() => setOpen(true)}>Open Command Menu</Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          {/* --- FIX: Keep CommandInput and CommandList as direct children of Command --- */}
          <Command>
            <div className="flex items-center border-b border-graphite-border">
              <DialogClose asChild>
                <IconButton variant="ghost" className="m-1">
                  <ArrowLeft />
                </IconButton>
              </DialogClose>
              <CommandInput placeholder="Type a command or search..." />
            </div>
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {commandItems.map((group) => (
                <CommandGroup key={group.group} heading={group.group}>
                  {group.items.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      disabled={item.disabled}
                      onSelect={() => setOpen(false)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <CommandShortcut>{item.shortcut}</CommandShortcut>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
          {/* --- END FIX --- */}
        </CommandDialog>
      </div>
    );
  },
};
