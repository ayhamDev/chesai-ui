import type { Meta, StoryObj } from "@storybook/react";
import { ArrowLeft } from "lucide-react";
import React, { useContext, useEffect, useRef } from "react";
import { AppBar } from "../appbar";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { ButtonGroup } from "../button-group";
import DeviceFrame from "../device";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { IconButton } from "../icon-button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../item";
import { createStackNavigator, useNavigation } from "../stack-router";
import { Typography } from "../typography";
import { DismissibleContext, LayoutRouter, useLayoutRouter } from "./index";

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
          "A declarative router for creating multi-element shared layout transitions. This version supports browser history, multiple presentation modes (fullscreen, modal), and interactive gesture-based dismissal.",
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
    dismissible: {
      control: "boolean",
      description: "Enable swipe-to-dismiss gesture on the screen.",
      table: { category: "Screen Props" },
    },
    dismissDirection: {
      control: "select",
      options: ["x", "y"],
      description: "The axis for the dismiss gesture.",
      table: { category: "Screen Props" },
      if: { arg: "dismissible" },
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

// --- Helper Components & Data ---

/**
 * A wrapper for ElasticScrollArea that reports its scroll position
 * to a parent Dismissible Screen to enable/disable drag gestures.
 */
const DismissibleScrollArea = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ElasticScrollArea>
>((props, ref) => {
  const context = useContext(DismissibleContext);
  const scrollRef = useRef<HTMLDivElement>(null);

  React.useImperativeHandle(ref, () => scrollRef.current!);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !context) return;

    const handleScroll = () => {
      // If scrollTop is 0, we're at the top.
      context.setIsAtTop(el.scrollTop === 0);
    };

    el.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => el.removeEventListener("scroll", handleScroll);
  }, [context]);

  return <ElasticScrollArea ref={scrollRef} {...props} />;
});

const sampleEmails = [
  {
    id: "email-1",
    sender: "Alisa Hester",
    avatar: "https://i.pravatar.cc/150?img=1",
    subject: "Project Update & Next Steps",
    preview: "Hey team, just wanted to give a quick update...",
    body: "Here is a much longer body of text to ensure that the content is scrollable. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. This will allow us to test the scroll lock functionality.",
  },
  {
    id: "email-2",
    sender: "Barry Cuda",
    avatar: "https://i.pravatar.cc/150?img=2",
    subject: "Lunch Plans?",
    preview: "Anyone up for lunch today? I'm craving tacos.",
    body: "Tacos sound great! Let's meet at the usual spot at 12:30 PM. I'll invite the rest of the team. This content is also here to demonstrate scrolling.",
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

// --- Stories ---

export const ModalPresentation: Story = {
  name: "2. Modal Presentation",
  args: {
    duration: 0.3,
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

export const DismissibleModalPresentation: Story = {
  name: "3. Dismissible Modal",
  args: {
    duration: 0.4,
    dismissible: true,
    dismissDirection: "y",
  },
  render: (args) => (
    <LayoutRouter {...args}>
      <LayoutRouter.List>
        <div className="h-full flex flex-col bg-graphite-background">
          <AppBar appBarColor="card">
            <Typography variant="h4">Dismissible Gallery</Typography>
          </AppBar>
          <div className="p-2 grid grid-cols-2 gap-2">
            {galleryData.map((item) => (
              <GalleryGridItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </LayoutRouter.List>
      {galleryData.map((item) => (
        <LayoutRouter.Screen
          key={item.id}
          id={item.id}
          presentation="modal"
          dismissible={args.dismissible}
          dismissDirection={args.dismissDirection}
        >
          <ModalDetailScreen item={item} />
        </LayoutRouter.Screen>
      ))}
    </LayoutRouter>
  ),
};

const DismissibleScrollScreen = ({
  email,
}: {
  email: (typeof sampleEmails)[0];
}) => {
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
      <DismissibleScrollArea>
        <div className="p-6 pt-2">
          <LayoutRouter.SharedElement tag="subject">
            <Typography variant="h3" className="mb-6">
              {email.subject}
            </Typography>
          </LayoutRouter.SharedElement>
          <div className="flex items-center gap-4 mb-4">
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
          <Typography variant="p">{email.body}</Typography>
          <Typography variant="p">{email.body}</Typography>
        </div>
      </DismissibleScrollArea>
    </div>
  );
};

export const DismissibleWithScroll: Story = {
  name: "4. Dismissible with Scrolling",
  args: {
    duration: 0.3,
    dismissible: true,
    dismissDirection: "y",
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates the 'scroll lock' pattern. You can scroll the content of the screen freely. The swipe-to-dismiss gesture will only activate when you are scrolled to the very top of the content.",
      },
    },
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
          dismissible={args.dismissible}
          dismissDirection={args.dismissDirection}
        >
          <DismissibleScrollScreen email={email} />
        </LayoutRouter.Screen>
      ))}
    </LayoutRouter>
  ),
};

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

export const IntegratingWithStackRouter: Story = {
  name: "5. Integrating with StackRouter",
  render: () => (
    <AppStack.Navigator initialRouteName="Main">
      <AppStack.Screen
        name="Main"
        component={MainScreen}
        options={{ headerShown: false }}
      />
      <AppStack.Screen
        name="Settings"
        component={({ navigation }) => (
          <div className="p-4" ref={navigation.scrollContainerRef}>
            <Typography variant="h4">Settings Page</Typography>
          </div>
        )}
      />
    </AppStack.Navigator>
  ),
};
