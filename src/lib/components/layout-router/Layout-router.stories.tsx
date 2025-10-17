import type { Meta, StoryObj } from "@storybook/react";
import {
  Archive,
  ArrowLeft,
  Bell,
  Cast,
  Delete,
  Home,
  MoreVertical,
  Pencil,
  Search,
  Settings,
  Star,
  ThumbsUp,
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
  // ... (rest of meta config is unchanged)
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
          "A declarative router for creating multi-element shared layout transitions. This version supports browser history and fullscreen transitions, demonstrated with a full mail client UI.",
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

// --- Sample Data (Unchanged) ---
const sampleEmails = [
  {
    id: "email-1",
    sender: "Alisa Hester",
    avatar: "https://i.pravatar.cc/150?img=1",
    subject: "Project Update & Next Steps",
    preview: "Hey team, just wanted to give a quick update...",
    timestamp: "2m ago",
    fullBody: "...",
  },
  {
    id: "email-2",
    sender: "Barry Cuda",
    avatar: "https://i.pravatar.cc/150?img=2",
    subject: "Lunch Plans?",
    preview: "Anyone up for lunch today? I'm craving tacos.",
    timestamp: "15m ago",
    fullBody: "...",
  },
  {
    id: "email-3",
    sender: "Charlie Enderson",
    avatar: "https://i.pravatar.cc/150?img=3",
    subject: "Design Feedback Required",
    preview: "Hi, I've just pushed the latest mockups...",
    timestamp: "1h ago",
    fullBody: "...",
  },
  {
    id: "email-4",
    sender: "Diana Prince",
    avatar: "https://i.pravatar.cc/150?img=4",
    subject: "Re: Q3 Budget",
    preview: "Thanks for sending that over, I'll take a look.",
    timestamp: "3h ago",
    fullBody: "...",
  },
  {
    id: "email-5",
    sender: "Ethan Hunt",
    avatar: "https://i.pravatar.cc/150?img=5",
    subject: "Your Mission, Should You Choose to Accept It",
    preview: "This message will self-destruct in 5 seconds.",
    timestamp: "Yesterday",
    fullBody: "...",
  },
];

// --- Reusable UI Components for the Story ---

const MailListItem = ({ email }: { email: (typeof sampleEmails)[0] }) => (
  <Item variant="secondary" shape="minimal" padding="sm">
    <ItemMedia>
      <LayoutRouter.SharedElement tag="avatar">
        <Avatar src={email.avatar} fallback={email.sender.slice(0, 2)} />
      </LayoutRouter.SharedElement>
    </ItemMedia>
    <ItemContent>
      <div className="flex justify-between items-start">
        <LayoutRouter.SharedElement tag="sender">
          <ItemTitle>{email.sender}</ItemTitle>
        </LayoutRouter.SharedElement>
        <LayoutRouter.SharedElement tag="timestamp">
          <Typography
            variant="muted"
            className="!mt-0 !text-xs whitespace-nowrap"
          >
            {email.timestamp}
          </Typography>
        </LayoutRouter.SharedElement>
      </div>
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
        endAdornments={[
          <IconButton
            key="archive"
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Archive"
          >
            <Archive size={20} />
          </IconButton>,
          <IconButton
            key="delete"
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Delete"
          >
            <Delete size={20} />
          </IconButton>,
          <IconButton
            key="more"
            type="button"
            variant="ghost"
            size="sm"
            aria-label="More options"
          >
            <MoreVertical size={20} />
          </IconButton>,
        ]}
      />

      <ElasticScrollArea className="flex-1">
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
              <Typography variant="muted" className="!mt-0">
                to me
              </Typography>
            </div>
            <LayoutRouter.SharedElement tag="timestamp">
              <Typography variant="muted" className="!mt-0 !text-xs">
                {email.timestamp}
              </Typography>
            </LayoutRouter.SharedElement>
            <IconButton variant="ghost" size="sm" aria-label="Favorite">
              <Star size={20} />
            </IconButton>
          </div>
          <Typography variant="p" className="mt-8">
            {email.fullBody} {email.fullBody} {email.fullBody}
          </Typography>
        </div>
      </ElasticScrollArea>
    </div>
  );
};

const InboxScreen = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const appBarProps = {
    scrollContainerRef: scrollRef,
    size: "lg" as const,
    scrollBehavior: "conditionally-sticky" as const,
    animatedBehavior: ["shadow"] as Array<"shadow">,
    appBarColor: "card" as const,
    largeHeaderRowHeight: 50,
  };
  const { contentPaddingTop } = useAppBar(appBarProps);

  return (
    <div className="w-full h-full relative bg-graphite-background flex flex-col">
      <AppBar
        {...appBarProps}
        children={<Typography variant="h4">Inbox</Typography>}
        endAdornments={[
          <IconButton key="compose" variant="ghost" aria-label="Compose">
            <Pencil size={20} />
          </IconButton>,
        ]}
        largeHeaderContent={
          <Input
            variant="secondary"
            shape="full"
            startAdornment={<Search className="h-5 w-5 text-gray-500" />}
            placeholder="Search mail..."
          />
        }
      />
      <ElasticScrollArea ref={scrollRef} className="flex-1">
        <div style={{ paddingTop: contentPaddingTop }}>
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
      </ElasticScrollArea>
    </div>
  );
};

export const MailClientApp: Story = {
  name: "Mail Client App",
  args: {
    duration: 0.5,
  },
  render: (args) => (
    <LayoutRouter {...args}>
      <LayoutRouter.List>
        <InboxScreen />
      </LayoutRouter.List>

      {sampleEmails.map((email) => (
        <LayoutRouter.Screen key={email.id} id={email.id}>
          <MailDetailScreen email={email} />
        </LayoutRouter.Screen>
      ))}
    </LayoutRouter>
  ),
};

// --- IMAGE GALLERY STORY (Unchanged) ---

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
  {
    id: "img-3",
    src: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=500&q=80",
    title: "Cool Cat",
    author: "Manja Vitolic",
  },
  {
    id: "img-4",
    src: "https://images.unsplash.com/photo-1583337130417-2346a1be2a21?w=500&q=80",
    title: "Happy Dog",
    author: "Karsten Winegeart",
  },
  {
    id: "img-5",
    src: "https://images.unsplash.com/photo-1574224252329-0017c66f5614?w=500&q=80",
    title: "Architectural Lines",
    author: "Dmitry Schemelev",
  },
  {
    id: "img-6",
    src: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=500&q=80",
    title: "Museum Hall",
    author: "Massimo Virgilio",
  },
];

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

const GalleryGridScreen = () => {
  return (
    <div className="h-full flex flex-col bg-graphite-background">
      <AppBar appBarColor="card">
        <Typography variant="h4">Image Gallery</Typography>
      </AppBar>
      <ElasticScrollArea className="flex-1">
        <div className="p-2 grid grid-cols-2 gap-2">
          {galleryData.map((item) => (
            <GalleryGridItem key={item.id} item={item} />
          ))}
        </div>
      </ElasticScrollArea>
    </div>
  );
};

const GalleryDetailScreen = ({ item }: { item: (typeof galleryData)[0] }) => {
  const { goBack } = useLayoutRouter();
  return (
    <div className="h-full flex flex-col bg-graphite-background">
      <AppBar
        appBarColor="card"
        startAdornment={
          <IconButton variant="ghost" onClick={goBack}>
            <ArrowLeft />
          </IconButton>
        }
      />
      <ElasticScrollArea className="flex-1">
        <div className="p-4">
          <LayoutRouter.SharedElement tag="image">
            <img
              src={item.src}
              alt={item.title}
              className="w-full h-auto rounded-2xl object-contain shadow-xl"
            />
          </LayoutRouter.SharedElement>
          <div className="mt-4">
            <LayoutRouter.SharedElement tag="title">
              <Typography variant="h3">{item.title}</Typography>
            </LayoutRouter.SharedElement>
            <Typography variant="muted">By {item.author}</Typography>
          </div>
          <Typography variant="p">
            This is where a detailed description of the image would go. The
            transition you just saw was powered by Framer Motion's `layoutId`,
            orchestrated by the `LayoutRouter`.
          </Typography>
        </div>
      </ElasticScrollArea>
    </div>
  );
};

export const ImageGallery: Story = {
  name: "Image Gallery",
  args: {
    duration: 0.4,
  },
  parameters: {
    docs: {
      description: {
        story:
          "A classic example of a shared element transition. Clicking a grid item animates both the image and its title into a full-screen detail view. This is achieved by wrapping the corresponding elements in `<LayoutRouter.SharedElement>` with a matching `tag` prop.",
      },
    },
  },
  render: (args) => (
    <LayoutRouter {...args}>
      <LayoutRouter.List>
        <GalleryGridScreen />
      </LayoutRouter.List>

      {galleryData.map((item) => (
        <LayoutRouter.Screen key={item.id} id={item.id}>
          <GalleryDetailScreen item={item} />
        </LayoutRouter.Screen>
      ))}
    </LayoutRouter>
  ),
};

// --- NEW: YOUTUBE CLONE STORY ---
const youtubeData = [
  {
    id: "yt-1",
    thumbnailSrc:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&q=80",
    title: "Designing the Future of UI/UX",
    channelName: "DesignCourse",
    channelAvatar: "https://i.pravatar.cc/150?img=10",
    views: "1.2M views",
    timestamp: "2 weeks ago",
  },
  {
    id: "yt-2",
    thumbnailSrc:
      "https://images.unsplash.com/photo-1521302200774-534b4b4334c9?w=500&q=80",
    title: "A Culinary Journey Through Italy",
    channelName: "FoodTraveler",
    channelAvatar: "https://i.pravatar.cc/150?img=11",
    views: "890K views",
    timestamp: "1 month ago",
  },
  {
    id: "yt-3",
    thumbnailSrc:
      "https://images.unsplash.com/photo-1542037104857-e93b0fe5758c?w=500&q=80",
    title: "Mastering Analog Photography",
    channelName: "AnalogLife",
    channelAvatar: "https://i.pravatar.cc/150?img=12",
    views: "45K views",
    timestamp: "3 days ago",
  },
  {
    id: "yt-4",
    thumbnailSrc:
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=500&q=80",
    title: "Into the Wild: A Hiking Documentary",
    channelName: "NatureExplorer",
    channelAvatar: "https://i.pravatar.cc/150?img=14",
    views: "3.5M views",
    timestamp: "6 months ago",
  },
];

const VideoCard = ({ video }: { video: (typeof youtubeData)[0] }) => (
  <LayoutRouter.Link id={video.id} className="cursor-pointer group">
    <div className="flex flex-col gap-3">
      <LayoutRouter.SharedElement tag="video-thumbnail">
        <img
          src={video.thumbnailSrc}
          alt={video.title}
          className="w-full aspect-video object-cover rounded-xl"
        />
      </LayoutRouter.SharedElement>
      <div className="flex items-start gap-3 px-2">
        <LayoutRouter.SharedElement tag="channel-avatar">
          <Avatar src={video.channelAvatar} size="sm" />
        </LayoutRouter.SharedElement>
        <div className="flex flex-col">
          <LayoutRouter.SharedElement tag="video-title">
            <Typography className="font-bold line-clamp-2">
              {video.title}
            </Typography>
          </LayoutRouter.SharedElement>
          <LayoutRouter.SharedElement tag="channel-info">
            <Typography variant="muted" className="!mt-0">
              {video.channelName} • {video.views} • {video.timestamp}
            </Typography>
          </LayoutRouter.SharedElement>
        </div>
      </div>
    </div>
  </LayoutRouter.Link>
);

const YouTubeHomeScreen = () => (
  <div className="h-full flex flex-col bg-graphite-background">
    <AppBar
      appBarColor="card"
      startAdornment={
        <Typography variant="h4" className="font-bold text-red-500">
          YouTube
        </Typography>
      }
      endAdornments={[
        <IconButton key="cast" variant="ghost">
          <Cast size={20} />
        </IconButton>,
        <IconButton key="notifications" variant="ghost">
          <Bell size={20} />
        </IconButton>,
        <IconButton key="search" variant="ghost">
          <Search size={20} />
        </IconButton>,
      ]}
    />
    <ElasticScrollArea className="flex-1">
      <div className="p-4 grid grid-cols-1 gap-6">
        {youtubeData.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </ElasticScrollArea>
  </div>
);

const VideoDetailScreen = ({ video }: { video: (typeof youtubeData)[0] }) => {
  const { goBack } = useLayoutRouter();
  return (
    <div className="h-full flex flex-col bg-graphite-background">
      <AppBar
        appBarColor="card"
        startAdornment={
          <IconButton variant="ghost" onClick={goBack}>
            <ArrowLeft />
          </IconButton>
        }
      />
      <ElasticScrollArea className="flex-1">
        <div className="flex flex-col">
          <LayoutRouter.SharedElement tag="video-thumbnail">
            <img
              src={video.thumbnailSrc}
              alt={video.title}
              className="w-full aspect-video object-cover"
            />
          </LayoutRouter.SharedElement>
          <div className="p-4 flex flex-col gap-4">
            <LayoutRouter.SharedElement tag="video-title">
              <Typography variant="h4">{video.title}</Typography>
            </LayoutRouter.SharedElement>
            <LayoutRouter.SharedElement tag="channel-info">
              <Typography variant="muted" className="!mt-0">
                {video.views} • {video.timestamp}
              </Typography>
            </LayoutRouter.SharedElement>

            <div className="flex items-center gap-3">
              <LayoutRouter.SharedElement tag="channel-avatar">
                <Avatar src={video.channelAvatar} size="sm" />
              </LayoutRouter.SharedElement>
              <Typography className="font-bold flex-1">
                {video.channelName}
              </Typography>
              <Button size="sm" shape="full">
                Subscribe
              </Button>
            </div>
            <ButtonGroup shape="full" className="w-full">
              <Button size="sm" variant="secondary">
                <ThumbsUp className="mr-2 h-4 w-4" />
                12K
              </Button>
              <Button size="sm" variant="secondary">
                Share
              </Button>
              <Button size="sm" variant="secondary">
                Download
              </Button>
            </ButtonGroup>
            <div className="h-96 rounded-lg bg-graphite-secondary p-4">
              <Typography variant="small" className="font-bold">
                Comments section...
              </Typography>
            </div>
          </div>
        </div>
      </ElasticScrollArea>
    </div>
  );
};

export const YouTubeClone: Story = {
  name: "YouTube Clone",
  args: {
    duration: 0.6,
  },
  parameters: {
    docs: {
      description: {
        story:
          "A YouTube-style UI demonstrating how multiple shared elements (`video-thumbnail`, `video-title`, `channel-avatar`, etc.) can be animated together to create a seamless transition from a list view to a detail view.",
      },
    },
  },
  render: (args) => (
    <LayoutRouter {...args}>
      <LayoutRouter.List>
        <YouTubeHomeScreen />
      </LayoutRouter.List>
      {youtubeData.map((video) => (
        <LayoutRouter.Screen key={video.id} id={video.id}>
          <VideoDetailScreen video={video} />
        </LayoutRouter.Screen>
      ))}
    </LayoutRouter>
  ),
};

// --- INTEGRATING WITH STACK ROUTER (Unchanged) ---

const AppStack = createStackNavigator<AppStackParamList>();

type AppStackParamList = {
  Main: undefined;
  Settings: undefined;
};
const photoData = [
  {
    id: "photo-1",
    src: "https://images.unsplash.com/photo-1517088613037-7a895121b6b5?w=500&q=80",
  },
  {
    id: "photo-2",
    src: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=500&q=80",
  },
  {
    id: "photo-3",
    src: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=500&q=80",
  },
  {
    id: "photo-4",
    src: "https://images.unsplash.com/photo-1583337130417-2346a1be2a21?w=500&q=80",
  },
];

const PhotoGridScreen = () => (
  <div className="p-4 grid grid-cols-2 gap-4">
    {photoData.map((photo) => (
      <LayoutRouter.Link
        key={photo.id}
        id={photo.id}
        className="cursor-pointer"
      >
        <LayoutRouter.SharedElement tag="photo-image">
          <img
            src={photo.src}
            alt={`Photo ${photo.id}`}
            className="w-full h-48 object-cover rounded-lg"
          />
        </LayoutRouter.SharedElement>
      </LayoutRouter.Link>
    ))}
  </div>
);

const PhotoDetailScreen = ({ photo }: { photo: (typeof photoData)[0] }) => {
  const { goBack } = useLayoutRouter();
  return (
    <div className="h-full bg-graphite-background flex flex-col">
      <AppBar
        appBarColor="card"
        startAdornment={
          <IconButton variant="ghost" onClick={goBack}>
            <ArrowLeft />
          </IconButton>
        }
      >
        <Typography variant="h4">Photo Detail</Typography>
      </AppBar>
      <div className="flex-1 p-4 flex flex-col justify-center items-center">
        <LayoutRouter.SharedElement tag="photo-image">
          <img
            src={photo.src}
            alt={`Photo ${photo.id}`}
            className="w-full max-w-sm rounded-xl object-contain"
          />
        </LayoutRouter.SharedElement>
        <Typography variant="p" className="mt-4">
          Details for photo {photo.id}.
        </Typography>
      </div>
    </div>
  );
};

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
            <PhotoGridScreen />
          </LayoutRouter.List>
          {photoData.map((photo) => (
            <LayoutRouter.Screen key={photo.id} id={photo.id}>
              <PhotoDetailScreen photo={photo} />
            </LayoutRouter.Screen>
          ))}
        </LayoutRouter>
      </div>
      <div className="p-2 border-t border-graphite-border bg-graphite-card">
        <ButtonGroup shape="minimal" className="w-full">
          <Button variant="primary" size="sm">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => stackNavigation.push("Settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};

const SettingsScreen = () => {
  const navigation = useNavigation();
  return (
    <div className="p-6 pt-[70px]" ref={navigation.scrollContainerRef}>
      <Typography variant="h3">Settings</Typography>
      <Typography variant="p">
        This is a separate screen managed by the top-level StackRouter.
      </Typography>
    </div>
  );
};

export const IntegratingWithStackRouter: Story = {
  name: "Integrating with StackRouter",
  parameters: {
    docs: {
      description: {
        story:
          "This example shows how to nest a `LayoutRouter` inside a `StackRouter`. The `StackRouter` handles primary navigation (e.g., between 'Main' and 'Settings'), while the `LayoutRouter` inside the 'Main' screen handles a shared-element transition for a photo gallery.",
      },
    },
  },
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
