import type { Meta, StoryObj } from "@storybook/react";
import {
  Archive,
  Cloud,
  Copy,
  Disc,
  Edit2,
  Link,
  ListPlus,
  Mail,
  Mic2,
  Moon,
  Music2,
  Plus,
  Share2,
  Trash2,
  Video,
} from "lucide-react";
import {
  ActionSheetProvider,
  useActionSheet,
} from "../../context/ActionSheetProvider";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { Card } from "../card";
import { Toaster, toast } from "../toast";
import { Typography } from "../typography";

const meta: Meta = {
  title: "Components/Sheet/ActionSheet (API)",
  decorators: [
    (Story) => (
      <ActionSheetProvider>
        <div className="h-200 w-full flex items-center justify-center bg-graphite-background">
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

const ActionSheetDemo = () => {
  const { show } = useActionSheet();

  // --- 1. GOOGLE PHOTOS STYLE (Customized Items) ---
  const handlePhotosStyle = async () => {
    const result = await show({
      sections: [
        {
          type: "grid",
          gridColumns: 4,
          items: [
            // Customize these items to be 'minimal' (rounded-2xl) instead of default full
            {
              id: "share",
              label: "Share",
              icon: <Share2 className="h-5 w-5" />,
              shape: "minimal",
            },
            {
              id: "add",
              label: "Add to",
              icon: <Plus className="h-5 w-5" />,
              shape: "minimal",
            },
            {
              id: "trash",
              label: "Trash",
              icon: <Trash2 className="h-5 w-5" />,
              shape: "minimal",
            },
            {
              id: "order",
              label: "Order",
              icon: <Copy className="h-5 w-5" />,
              shape: "minimal",
            },
            {
              id: "archive",
              label: "Archive",
              icon: <Archive className="h-5 w-5" />,
              shape: "minimal",
            },
            {
              id: "edit",
              label: "Edit",
              icon: <Edit2 className="h-5 w-5" />,
              shape: "minimal",
            },
          ],
        },
        {
          type: "carousel",
          title: "Send",
          items: [
            {
              id: "u1",
              label: "Alejandro",
              variant: "image",
              imageSrc: "https://i.pravatar.cc/150?u=1",
              shape: "full", // Circle avatars
            },
            {
              id: "u2",
              label: "Oli Ortega",
              variant: "image",
              imageSrc: "https://i.pravatar.cc/150?u=2",
            },
            {
              id: "u3",
              label: "Carmen",
              variant: "image",
              imageSrc: "https://i.pravatar.cc/150?u=3",
            },
            {
              id: "u4",
              label: "Ana Russo",
              variant: "image",
              imageSrc: "https://i.pravatar.cc/150?u=4",
            },
          ],
        },
      ],
      cancelLabel: "Cancel",
    });

    if (result) toast.success(`Selected: ${result}`);
  };

  // --- 2. SPOTIFY STYLE ---
  const handleMusicStyle = async () => {
    const result = await show({
      variant: "secondary",
      header: (
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="w-32 h-32 shadow-xl rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300"
              className="w-full h-full object-cover"
              alt="Album"
            />
          </div>
          <div className="text-center">
            <Typography variant="h4">Oli's Picks</Typography>
            <Typography variant="muted">Various Artists</Typography>
          </div>
        </div>
      ),
      sections: [
        {
          type: "list",
          items: [
            {
              id: "playlist",
              label: "Add to Playlist...",
              icon: <ListPlus className="h-5 w-5" />,
              shape: "minimal", // List items typically use minimal shape
            },
            {
              id: "album",
              label: "Go to Album",
              icon: <Disc className="h-5 w-5" />,
            },
            {
              id: "artist",
              label: "Go to Artist",
              icon: <Mic2 className="h-5 w-5" />,
            },
            {
              id: "sleep",
              label: "Sleep timer",
              icon: <Moon className="h-5 w-5" />,
            },
          ],
        },
      ],
    });
    if (result) toast.success(`Action: ${result}`);
  };

  // --- 3. ANDROID SHARE SHEET ---
  const handleShareSheet = async () => {
    const result = await show({
      variant: "surface",
      sheetProps: { snapPoints: [0.5, 0.9], activeSnapPoint: 0.5 },
      header: (
        <div className="flex items-center gap-4 px-6 pb-4">
          <div className="w-12 h-12 bg-surface-container-high rounded-md overflow-hidden shrink-0">
            <img
              src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=200"
              className="w-full h-full object-cover"
              alt="Prev"
            />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <Typography variant="h1" className="leading-tight truncate">
              Nature.jpg
            </Typography>
            <Typography variant="small" className="opacity-60">
              2.4 MB • JPG
            </Typography>
          </div>
        </div>
      ),
      sections: [
        {
          type: "custom",
          content: (
            <div className="flex gap-3 px-6 mb-4 justify-start overflow-x-auto no-scrollbar">
              <Button variant="secondary" shape="full" className="px-6 h-10">
                <Copy className="mr-2 h-4 w-4 opacity-70" /> Copy
              </Button>
              <Button variant="secondary" shape="full" className="px-6 h-10">
                <Share2 className="mr-2 h-4 w-4 opacity-70" /> Nearby
              </Button>
            </div>
          ),
        },
        {
          type: "carousel",
          items: [
            {
              id: "u1",
              label: "Alejandro",
              variant: "image",
              imageSrc: "https://i.pravatar.cc/150?u=1",
            },
            {
              id: "u2",
              label: "Ines",
              variant: "image",
              imageSrc: "https://i.pravatar.cc/150?u=8",
            },
            {
              id: "u3",
              label: "Oli",
              variant: "image",
              imageSrc: "https://i.pravatar.cc/150?u=2",
            },
            {
              id: "u4",
              label: "Carmen",
              variant: "image",
              imageSrc: "https://i.pravatar.cc/150?u=3",
            },
          ],
        },
        {
          type: "carousel",
          items: [
            {
              id: "files",
              label: "Files",
              icon: <Archive className="h-6 w-6 text-blue-500" />,
            },
            {
              id: "gmail",
              label: "Gmail",
              icon: <Mail className="h-6 w-6 text-red-500" />,
              disabled: true, // Example of disabled item
            },
            {
              id: "meet",
              label: "Meet",
              icon: <Video className="h-6 w-6 text-green-500" />,
            },
            {
              id: "drive",
              label: "Drive",
              icon: <Cloud className="h-6 w-6 text-yellow-500" />,
            },
            {
              id: "link",
              label: "Link",
              icon: <Link className="h-6 w-6" />,
            },
          ],
        },
      ],
    });
    if (result) toast.success(`Shared via ${result}`);
  };

  return (
    <Card className="flex flex-col gap-6 p-8 min-w-[320px]">
      <Typography variant="h4" className="text-center mb-2">
        Action Sheet Styles
      </Typography>

      <Button
        onClick={handlePhotosStyle}
        variant="secondary"
        className="justify-start"
      >
        Google Photos Style
      </Button>

      <Button
        onClick={handleMusicStyle}
        variant="secondary"
        className="justify-start"
      >
        Music / Spotify Style
      </Button>

      <Button
        onClick={handleShareSheet}
        variant="primary"
        className="justify-start"
      >
        Android Share Sheet
      </Button>
    </Card>
  );
};

export const Showcase: StoryObj = {
  render: () => <ActionSheetDemo />,
};
