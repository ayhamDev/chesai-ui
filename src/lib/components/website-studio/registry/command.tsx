import React from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "../../command";
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from "lucide-react";
import type { RegistryComponent } from "../types";

export const CommandConfig: RegistryComponent = {
  name: "Command Palette",
  category: "Navigation",
  render: ({ placeholder, glass, ...props }) => (
    <div className="w-full max-w-lg mx-auto shadow-2xl rounded-2xl border border-outline-variant/30" {...props}>
      <Command glass={glass}>
        <CommandInput placeholder={placeholder || "Type a command or search..."} />
        <CommandList className="max-h-[300px]">
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
          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="mr-3 h-5 w-5 opacity-70" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard className="mr-3 h-5 w-5 opacity-70" />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-3 h-5 w-5 opacity-70" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
  controls: {
    placeholder: {
      type: "text",
      label: "Search Placeholder",
      group: "Content",
      defaultValue: "Type a command or search...",
    },
    glass: {
      type: "boolean",
      label: "Glassmorphism Effect",
      group: "Aesthetics",
      defaultValue: false,
    },
  },
};
