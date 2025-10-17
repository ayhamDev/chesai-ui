import type { Meta, StoryObj } from "@storybook/react";
import {
  Archive,
  ArrowLeft,
  Delete,
  Home,
  MoreVertical,
  Pencil,
  Search,
  Settings,
  Star,
} from "lucide-react";
import { useRef } from "react";
import { useAppBar } from "../../hooks/useAppBar";
import { AppBar } from "../appbar";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { ButtonGroup } from "../button-group";
import DeviceFrame from "../device";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { IconButton } from "../icon-button";
import { Input } from "../input";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../item";
import { createStackNavigator, useNavigation } from "../stack-router";
import { Typography } from "../typography";
import { LayoutRouter, useLayoutRouter } from "./index";

const meta: Meta<typeof LayoutRouter> = {
  title: "Components/Navigators/LayoutRouter",
  component: LayoutRouter,
  subcomponents: {
    List: LayoutRouter.List,
    Link: LayoutRouter.Link,
    Screen: LayoutRouter.Screen,
    SharedElement: LayoutRouter.SharedElement,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A declarative router for creating multi-element shared layout transitions. This version supports browser history and multiple presentation modes (fullscreen, modal), demonstrated with a full mail client UI.",
      },
    },
  },
  argTypes: {
    duration: {
      control: { type: "range", min: 0.2, max: 2, step: 0.1 },
      description: "The duration of the transition in seconds.",
    },
    easing: {
      control: "object",
      description: "An array of 4 numbers for a cubic bezier easing curve.",
    },
  },
  decorators: [
    (Story) => (
      <DeviceFrame>
        <Story />
      </DeviceFrame>
    ),
  ],
};

export default meta;
type Story = StoryObj;

// --- Sample Data ---
const sampleEmails = [
  {
    id: "email-1",
    sender: "Alisa Hester",
    avatar: "https://i.pravatar.cc/150?img=1",
    subject: "Project Update & Next Steps",
    preview: "Hey team, just wanted to give a quick update...",
    fullBody: "...",
  },
  {
    id: "email-2",
    sender: "Barry Cuda",
    avatar: "https://i.pravatar.cc/150?img=2",
    subject: "Lunch Plans?",
    preview: "Anyone up for lunch today? I'm craving tacos.",
    fullBody: "...",
  },
];

const galleryData = [
  {
    id: "img-1",
    src: "https://images.unsplash.com/photo-1517088613037-7a895121b6b5?w=500&q=80",
    title: "Vibrant Chameleon",
    author: "Photos by Lanty",
  },
  {
    id: "img-2",
    src: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=500&q=80",
    title: "Mountain Reflection",
    author: "Quino Al",
  },
];

// --- Reusable UI Components for the Stories ---

const MailListItem = ({ email }: { email: (typeof sampleEmails)[0] }) => (
  <Item variant="secondary" shape="minimal" padding="sm">
    <ItemMedia>
      <LayoutRouter.SharedElement tag="avatar">
        <Avatar src={email.avatar} fallback={email.sender.slice(0, 2)} />
      </LayoutRouter.SharedElement>
    </ItemMedia>
    <ItemContent>
      <LayoutRouter.SharedElement tag="sender">
        <ItemTitle>{email.sender}</ItemTitle>
      </LayoutRouter.SharedElement>
      <LayoutRouter.SharedElement tag="subject">
        <ItemDescription className="font-semibold !text-graphite-foreground/90">
          {email.subject}
        </ItemDescription>
      </LayoutRouter.SharedElement>
      <ItemDescription>{email.preview}</ItemDescription>
    </ItemContent>
  </Item>
);

const MailDetailScreen = ({ email }: { email: (typeof sampleEmails)[0] }) => {
  const { goBack } = useLayoutRouter();
  return (
    <div className="overflow-hidden h-full flex flex-col bg-graphite-card">
      <AppBar
        appBarColor="card"
        startAdornment={
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={goBack}
            aria-label="Go back"
          >
            <ArrowLeft />
          </IconButton>
        }
      />
      <div className="p-6 pt-2">
        <LayoutRouter.SharedElement tag="subject">
          <Typography variant="h3" className="mb-6">
            {email.subject}
          </Typography>
        </LayoutRouter.SharedElement>
        <div className="flex items-center gap-4">
          <LayoutRouter.SharedElement tag="avatar">
            <Avatar
              size="lg"
              src={email.avatar}
              fallback={email.sender.slice(0, 2)}
            />
          </LayoutRouter.SharedElement>
          <div className="flex-1">
            <LayoutRouter.SharedElement tag="sender">
              <Typography variant="large">{email.sender}</Typography>
            </LayoutRouter.SharedElement>
          </div>
        </div>
      </div>
    </div>
  );
};

const InboxScreen = () => (
  <div className="w-full h-full relative bg-graphite-background flex flex-col">
    <AppBar appBarColor="card">
      <Typography variant="h4">Inbox</Typography>
    </AppBar>
    <div className="p-2 flex flex-col gap-2">
      {sampleEmails.map((email) => (
        <LayoutRouter.Link
          key={email.id}
          id={email.id}
          className="cursor-pointer"
        >
          <MailListItem email={email} />
        </LayoutRouter.Link>
      ))}
    </div>
  </div>
);

export const FullscreenPresentation: Story = {
  name: "1. Fullscreen Presentation (Default)",
  args: {
    duration: 0.5,
  },
  render: (args) => (
    <LayoutRouter {...args}>
      <LayoutRouter.List>
        <InboxScreen />
      </LayoutRouter.List>
      {sampleEmails.map((email) => (
        <LayoutRouter.Screen
          key={email.id}
          id={email.id}
          presentation="fullscreen"
        >
          <MailDetailScreen email={email} />
        </LayoutRouter.Screen>
      ))}
    </LayoutRouter>
  ),
};

// --- NEW: Modal Presentation Story ---
const GalleryGridItem = ({ item }: { item: (typeof galleryData)[0] }) => (
  <LayoutRouter.Link id={item.id} className="cursor-pointer group">
    <div className="relative overflow-hidden rounded-xl aspect-square">
      <LayoutRouter.SharedElement tag="image">
        <img
          src={item.src}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </LayoutRouter.SharedElement>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <LayoutRouter.SharedElement tag="title">
          <Typography as="h3" className="font-bold text-white">
            {item.title}
          </Typography>
        </LayoutRouter.SharedElement>
      </div>
    </div>
  </LayoutRouter.Link>
);

const ModalDetailScreen = ({ item }: { item: (typeof galleryData)[0] }) => {
  const { goBack } = useLayoutRouter();
  return (
    <div className="p-4 flex flex-col">
      <LayoutRouter.SharedElement tag="image">
        <img
          src={item.src}
          alt={item.title}
          className="w-full h-[400px] rounded-lg object-cover"
        />
      </LayoutRouter.SharedElement>
      <div className="mt-4">
        <LayoutRouter.SharedElement tag="title">
          <Typography variant="h4">{item.title}</Typography>
        </LayoutRouter.SharedElement>
        <Typography variant="muted">By {item.author}</Typography>
        <Button onClick={goBack} className="mt-4" size="sm">
          Close
        </Button>
      </div>
    </div>
  );
};

export const ModalPresentation: Story = {
  name: "2. Modal Presentation",
  args: {
    duration: 0.4,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Set `presentation='modal'` on a `<LayoutRouter.Screen>` to make it appear as a floating modal. The backdrop can be clicked to dismiss it, and the 'Escape' key also works.",
      },
    },
  },
  render: (args) => (
    <LayoutRouter {...args}>
      <LayoutRouter.List>
        <div className="h-full flex flex-col bg-graphite-background">
          <AppBar appBarColor="card">
            <Typography variant="h4">Modal Gallery</Typography>
          </AppBar>
          <div className="p-2 grid grid-cols-2 gap-2">
            {galleryData.map((item) => (
              <GalleryGridItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </LayoutRouter.List>

      {galleryData.map((item) => (
        <LayoutRouter.Screen key={item.id} id={item.id} presentation="modal">
          <ModalDetailScreen item={item} />
        </LayoutRouter.Screen>
      ))}
    </LayoutRouter>
  ),
};

// ... (Rest of the stories like IntegratingWithStackRouter remain unchanged)
// --- INTEGRATING WITH STACK ROUTER ---
type AppStackParamList = { Main: undefined; Settings: undefined };
const AppStack = createStackNavigator<AppStackParamList>();
const MainScreen = () => {
  const stackNavigation = useNavigation<AppStackParamList>();
  return (
    <div className="h-full flex flex-col">
      <AppBar appBarColor="card">
        <Typography variant="h4">Main Screen</Typography>
      </AppBar>
      <div className="flex-1 overflow-hidden">
        <LayoutRouter duration={0.4}>
          <LayoutRouter.List>
            <div className="p-4 grid grid-cols-2 gap-4">
              {galleryData.map((item) => (
                <GalleryGridItem key={item.id} item={item} />
              ))}
            </div>
          </LayoutRouter.List>
          {galleryData.map((item) => (
            <LayoutRouter.Screen
              key={item.id}
              id={item.id}
              presentation="modal"
            >
              <ModalDetailScreen item={item} />
            </LayoutRouter.Screen>
          ))}
        </LayoutRouter>
      </div>
      <div className="p-2 border-t border-graphite-border bg-graphite-card">
        <ButtonGroup shape="minimal" className="w-full">
          <Button variant="primary" size="sm">
            Home
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => stackNavigation.push("Settings")}
          >
            Settings
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};
const SettingsScreen = () => (
  <div className="p-6 pt-[70px]">
    <Typography variant="h3">Settings</Typography>
  </div>
);
export const IntegratingWithStackRouter: Story = {
  name: "3. Integrating with StackRouter",
  render: () => (
    <AppStack.Navigator initialRouteName="Main">
      <AppStack.Screen
        name="Main"
        component={MainScreen}
        options={{ headerShown: false }}
      />
      <AppStack.Screen name="Settings" component={SettingsScreen} />
    </AppStack.Navigator>
  ),
};
