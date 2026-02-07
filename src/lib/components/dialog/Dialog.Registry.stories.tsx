import type { Meta, StoryObj } from "@storybook/react";
import { Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { DialogProvider, useDialog } from "../../context/DialogProvider";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { Input } from "../input";
import { Toaster, toast } from "../toast";
import { Typography } from "../typography";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./index";

const meta: Meta = {
  title: "Components/Dialog/Dialog (Registry)",
  decorators: [
    (Story) => (
      <DialogProvider>
        <div className="h-[600px] w-full flex items-center justify-center bg-graphite-background">
          <Toaster />
          <Story />
        </div>
      </DialogProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

// --- CUSTOM DIALOGS ---

const EditProfileDialog = ({
  user,
  onClose,
}: {
  user: { name: string; email: string };
  onClose: () => void;
}) => {
  const { openDialog } = useDialog();
  const [name, setName] = useState(user.name);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Profile</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-4">
        <div className="flex justify-center">
          <Avatar
            src="https://i.pravatar.cc/150?img=12"
            size="xl"
            fallback="JD"
          />
        </div>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input label="Email" value={user.email} disabled />

        <Button
          variant="outline"
          onClick={() => openDialog("settings")}
          startIcon={<Settings className="h-4 w-4" />}
        >
          Advanced Settings (Stacking)
        </Button>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            toast.success("Profile saved");
            onClose();
          }}
        >
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const SettingsDialog = ({ onClose }: { onClose: () => void }) => {
  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Advanced Settings</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <Typography variant="p">
          This is a second dialog stacked on top of the first one. History
          management handles the back button correctly for both.
        </Typography>
      </div>
      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  );
};

// --- MAIN DEMO ---

const RegistryDemo = () => {
  const { registerDialog, openDialog, show } = useDialog();
  // Register components once
  useEffect(() => {
    registerDialog("edit-profile", EditProfileDialog);
    registerDialog("settings", SettingsDialog);
  }, [registerDialog]);

  return (
    <div className="flex flex-col items-center gap-4 text-center max-w-md p-6">
      <Typography variant="display-small">Registry & Stacking</Typography>
      <Typography variant="label-medium" className="text-gray-500">
        Register custom forms or complex views as dialogs.
        <br />
        Click below to open the "Edit Profile" dialog, then try opening
        "Settings" from within it.
      </Typography>

      <Button
        size="lg"
        startIcon={<User className="h-5 w-5" />}
        onClick={() =>
          openDialog("edit-profile", {
            user: { name: "Jane Doe", email: "jane@example.com" },
          })
        }
      >
        Edit Profile
      </Button>
    </div>
  );
};

export const RegisteredDialogs: StoryObj = {
  render: () => <RegistryDemo />,
};
