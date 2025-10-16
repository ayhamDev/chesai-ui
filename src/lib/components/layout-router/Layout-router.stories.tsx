import type { Meta, StoryObj } from "@storybook/react";
import {
  Archive,
  ArrowLeft,
  Delete,
  MoreVertical,
  Pencil,
  Search,
  Star,
} from "lucide-react";
import { useRef } from "react";
import { useAppBar } from "../../hooks/useAppBar";
import { AppBar } from "../appbar";
import { Avatar } from "../avatar";
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
