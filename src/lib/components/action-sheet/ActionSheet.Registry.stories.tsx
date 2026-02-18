import type { Meta, StoryObj } from "@storybook/react";
import { Share2, User } from "lucide-react";
import { useEffect } from "react";
import {
  ActionSheetProvider,
  useActionSheet,
} from "../../context/ActionSheetProvider";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { Item, ItemContent, ItemTitle } from "../item";
import { SheetContent, SheetGrabber, SheetHeader, SheetTitle } from "../sheet";
import { Toaster, toast } from "../toast";
import { Typography } from "../typography";

const meta: Meta = {
  title: "Components/Sheet/ActionSheet (Registry)",
  decorators: [
    (Story) => (
      <ActionSheetProvider>
        <div className="h-[600px] w-full flex flex-col items-center justify-center bg-graphite-background relative overflow-hidden border border-graphite-border rounded-xl">
          <Toaster />
          <Story />
        </div>
      </ActionSheetProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

// --- 1. Define Custom Sheet Components ---

const ProfileSheet = ({
  name,
  email,
  onClose,
}: {
  name: string;
  email: string;
  onClose: () => void;
}) => {
  const { openSheet } = useActionSheet();

  return (
    <SheetContent>
      <SheetGrabber />
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Avatar
            size="xl"
            fallback={name[0]}
            src="https://i.pravatar.cc/300"
          />
          <div>
            <Typography variant="title-medium">{name}</Typography>
            <Typography variant="body-small" muted={true}>
              {email}
            </Typography>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="secondary" onClick={() => openSheet("settings")}>
            Open Settings (Stacking)
          </Button>
          <Button
            variant="outline"
            onClick={() => openSheet("share", { title: "Profile Link" })}
          >
            Share Profile (Stacking)
          </Button>
        </div>

        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      </div>
    </SheetContent>
  );
};

const SettingsSheet = ({ onClose }: { onClose: () => void }) => {
  return (
    <SheetContent className="h-[50vh]">
      <SheetGrabber />
      <SheetHeader>
        <SheetTitle>Settings</SheetTitle>
      </SheetHeader>
      <div className="p-4 flex flex-col gap-2">
        <Item
          variant="ghost"
          onClick={() => toast("Notification settings clicked")}
        >
          <ItemContent>
            <ItemTitle>Notifications</ItemTitle>
          </ItemContent>
        </Item>
        <Item variant="ghost" onClick={() => toast("Privacy settings clicked")}>
          <ItemContent>
            <ItemTitle>Privacy</ItemTitle>
          </ItemContent>
        </Item>
        <Item variant="ghost" className="text-red-500">
          <ItemContent>
            <ItemTitle>Log Out</ItemTitle>
          </ItemContent>
        </Item>
        <Button className="mt-4" onClick={onClose}>
          Close Settings
        </Button>
      </div>
    </SheetContent>
  );
};

const ShareSheet = ({ title }: { title: string }) => {
  return (
    <SheetContent>
      <SheetGrabber />
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
      </SheetHeader>
      <div className="grid grid-cols-4 gap-4 p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
            <Share2 size={20} />
          </div>
          <span className="text-xs">Copy</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
            <User size={20} />
          </div>
          <span className="text-xs">Contact</span>
        </div>
      </div>
    </SheetContent>
  );
};

// --- 2. The Main Component that registers them ---

const RegistryDemo = () => {
  const { registerSheet, openSheet } = useActionSheet();

  // Register components once on mount
  useEffect(() => {
    registerSheet("profile", ProfileSheet);
    registerSheet("settings", SettingsSheet);
    registerSheet("share", ShareSheet);
  }, [registerSheet]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Typography variant="title-medium">Registry & Stacking</Typography>
      <Typography body-medium className="text-center max-w-md text-gray-500">
        Click below to open a registered "Profile" sheet. Inside it, you can
        open "Settings" or "Share", demonstrating stacking.
        <br />
        <br />
        <b>Try the browser Back button!</b> It will close the top-most sheet.
      </Typography>

      <Button
        size="lg"
        onClick={() =>
          openSheet("profile", {
            name: "Alex Morgan",
            email: "alex@example.com",
          })
        }
      >
        Open Profile Sheet
      </Button>

      <Button variant="secondary" onClick={() => openSheet("settings")}>
        Direct Open Settings
      </Button>
    </div>
  );
};

export const RegisteredSheets: StoryObj = {
  render: () => <RegistryDemo />,
};
