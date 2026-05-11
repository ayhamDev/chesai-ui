import type { Meta, StoryObj } from "@storybook/react";
import { Mail, MoreVertical, Search, Sparkles } from "lucide-react";
import { Button } from "../button";
import DeviceFrame from "../device";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { IconButton } from "../icon-button";
import { Input } from "../input";
import { Item, ItemContent, ItemTitle } from "../item";
import { Typography } from "../typography";
import { createStackNavigator, useNavigation, useRoute } from "./index";
import type { RouteProp } from "./types";

const meta: Meta = {
  title: "Components/Navigators/StackRouter",
  component: undefined,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A stack navigator that mimics the React Navigation API for the web. It uses `AppBar` for headers and Framer Motion for smooth, native-like screen transitions. Create a navigator instance with `createStackNavigator()`.",
      },
    },
  },
  decorators: [
    (Story) => {
      return (
        <DeviceFrame>
          <Story />
        </DeviceFrame>
      );
    },
  ],
};
export default meta;

// --- 1. Basic Navigation Example ---
type BasicStackParamList = {
  Home: undefined;
  Profile: { userId: string; name: string };
};
const BasicStack = createStackNavigator<BasicStackParamList>();

const HomeScreen = () => {
  const navigation = useNavigation<BasicStackParamList>();
  return (
    <div className="p-6 pt-[70px]" ref={navigation.scrollContainerRef}>
      <Typography variant="title-small">Home Screen</Typography>
      <Typography variant="body-medium">
        This is the initial screen of the stack.
      </Typography>
      <Button
        className="mt-4"
        onClick={() =>
          navigation.push("Profile", { userId: "user-123", name: "Alice" })
        }
      >
        Go to Alice's Profile
      </Button>
    </div>
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation<BasicStackParamList>();
  const route = useRoute<BasicStackParamList, "Profile">();
  const { userId, name } = route.params;

  return (
    <div className="p-6 pt-[70px]" ref={navigation.scrollContainerRef}>
      <Typography variant="title-small">Profile Screen</Typography>
      <Typography variant="body-medium">User: {name}</Typography>
      <Typography variant="body-small" muted={true}>
        ID: {userId}
      </Typography>
      <Button
        className="mt-4"
        variant="secondary"
        size={"sm"}
        onClick={() => navigation.goBack()}
      >
        Go Back Manually
      </Button>
    </div>
  );
};

export const BasicNavigation: StoryObj = {
  name: "1. Basic Navigation",
  render: () => (
    <BasicStack.Navigator initialRouteName="Home">
      <BasicStack.Screen name="Home" component={HomeScreen} />
      <BasicStack.Screen name="Profile" component={ProfileScreen} />
    </BasicStack.Navigator>
  ),
};

// --- 2. Advanced AppBar Integration Example ---
type AdvancedStackParamList = {
  SearchFeed: undefined;
  Detail: { itemId: string };
};
const AdvancedStack = createStackNavigator<AdvancedStackParamList>();

const SearchFeedScreen = () => {
  const navigation = useNavigation<AdvancedStackParamList>();

  return (
    <ElasticScrollArea ref={navigation.scrollContainerRef}>
      {/* 152px for the Large variant height */}
      <div className="p-4 pt-[164px] flex flex-col gap-3">
        <Typography variant="body-medium" className="mb-4">
          This screen utilizes the expanded features of the AppBar API via the
          Stack Router options. The search bar is injected into the{" "}
          <code>headerExpanded</code> slot and smoothly transitions across
          screens.
        </Typography>
        {Array.from({ length: 15 }).map((_, i) => (
          <Item
            key={i}
            variant="secondary"
            shape="minimal"
            onClick={() => navigation.push("Detail", { itemId: `item-${i}` })}
            className="cursor-pointer"
          >
            <ItemContent>
              <ItemTitle>Search Result {i + 1}</ItemTitle>
            </ItemContent>
          </Item>
        ))}
      </div>
    </ElasticScrollArea>
  );
};

const DetailScreen = () => {
  const navigation = useNavigation<AdvancedStackParamList>();
  return (
    <ElasticScrollArea ref={navigation.scrollContainerRef}>
      {/* 64px for the Small variant height */}
      <div className="p-4 pt-[84px]">
        <Typography variant="title-medium">Item Details</Typography>
        <Typography variant="body-medium" className="mt-4">
          Notice how the expanded search input cross-faded out, and the custom
          Top Row content faded in perfectly without overlapping.
        </Typography>
        <Button
          onClick={() => navigation.goBack()}
          variant="outline"
          className="mt-8"
        >
          Go Back
        </Button>
      </div>
    </ElasticScrollArea>
  );
};

export const AdvancedAppBarIntegration: StoryObj = {
  name: "2. Advanced AppBar Features",
  render: () => (
    <AdvancedStack.Navigator initialRouteName="SearchFeed">
      <AdvancedStack.Screen
        name="SearchFeed"
        component={SearchFeedScreen}
        options={{
          appBarProps: {
            variant: "large",
            color: "surface-container-low",
            scrollBehavior: "conditionally-sticky",
          },
          headerTopRow: () => (
            <Typography variant="title-large">Discover</Typography>
          ),
          headerExpanded: () => (
            <Input
              variant="secondary"
              shape="full"
              placeholder="Search components..."
              startContent={
                <Search className="w-5 h-5 text-on-surface-variant" />
              }
            />
          ),
          headerRight: () => (
            <IconButton variant="ghost">
              <Sparkles className="w-5 h-5" />
            </IconButton>
          ),
        }}
      />
      <AdvancedStack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          appBarProps: {
            variant: "small", // FIX: Used "small" to avoid rendering default expanded title
            color: "surface",
          },
          headerTopRow: () => (
            <Typography variant="title-large" className="text-primary">
              Custom Title Row
            </Typography>
          ),

          headerRight: () => (
            <IconButton variant="ghost">
              <MoreVertical className="w-5 h-5" />
            </IconButton>
          ),
        }}
      />
    </AdvancedStack.Navigator>
  ),
};

// --- 3. Transition Presets Example ---
type AnimationStackParamList = {
  Main: undefined;
  None: undefined;
  Fade: undefined;
  ZoomFade: undefined;
  FadeRight: undefined;
  FadeLeft: undefined;
  FadeTop: undefined;
  FadeBottom: undefined;
  Flip: undefined;
  SlideRight: undefined;
  SlideBottom: undefined;
  SlideLeft: undefined;
  SlideTop: undefined;
};
const AnimationStack = createStackNavigator<AnimationStackParamList>();

const MainScreen = () => {
  const navigation = useNavigation<AnimationStackParamList>();

  return (
    <ElasticScrollArea
      scrollbarVisibility="hidden"
      className="pt-[70px]"
      ref={navigation.scrollContainerRef}
    >
      <div className="box-border p-4 flex flex-col gap-4 mt-4">
        <Typography variant="title-small">Animation Presets</Typography>
        <Button className="w-fit" onClick={() => navigation.push("None")}>
          Push with 'None'
        </Button>
        <Button className="w-fit" onClick={() => navigation.push("Fade")}>
          Push with 'Fade'
        </Button>
        <Button className="w-fit" onClick={() => navigation.push("ZoomFade")}>
          Push with 'ZoomFade'
        </Button>
        <Button className="w-fit" onClick={() => navigation.push("FadeRight")}>
          Push with 'Fade From Right'
        </Button>
        <Button className="w-fit" onClick={() => navigation.push("FadeLeft")}>
          Push with 'Fade From Left'
        </Button>
        <Button className="w-fit" onClick={() => navigation.push("FadeTop")}>
          Push with 'Fade From Top'
        </Button>
        <Button className="w-fit" onClick={() => navigation.push("FadeBottom")}>
          Push with 'Fade From Bottom'
        </Button>
        <Button className="w-fit" onClick={() => navigation.push("Flip")}>
          Push with 'Flip'
        </Button>
        <Button className="w-fit" onClick={() => navigation.push("SlideRight")}>
          Push with 'Slide From Right' (defualt)
        </Button>
        <Button
          className="w-fit"
          onClick={() => navigation.push("SlideBottom")}
        >
          Push with 'Slide from Bottom'
        </Button>
        <Button className="w-fit" onClick={() => navigation.push("SlideLeft")}>
          Push with 'Slide from Left'
        </Button>
        <Button className="w-fit" onClick={() => navigation.push("SlideTop")}>
          Push with 'Slide from Top'
        </Button>
      </div>
    </ElasticScrollArea>
  );
};

const GenericScreen = ({ route }: { route: RouteProp<any, any> }) => {
  const navigation = useNavigation<AnimationStackParamList>();

  return (
    <div className="p-6 pt-[70px]" ref={navigation.scrollContainerRef}>
      <Typography variant="title-small">{route.name} Screen</Typography>
      <Typography variant="body-medium">
        This screen transitioned using its specified animation preset.
      </Typography>
      <Button
        className="mt-4"
        variant="primary"
        size={"sm"}
        onClick={() => navigation.push(route.name)}
      >
        Push More
      </Button>
      <Button
        className="mt-4"
        variant="secondary"
        size={"sm"}
        onClick={() => navigation.goBack()}
      >
        Go Back
      </Button>
    </div>
  );
};

export const TransitionPresets: StoryObj = {
  name: "3. Transition Presets",
  render: () => (
    <AnimationStack.Navigator initialRouteName="Main">
      <AnimationStack.Screen name="Main" component={MainScreen} />
      <AnimationStack.Screen
        name="None"
        component={GenericScreen}
        options={{ animation: "none" }}
      />
      <AnimationStack.Screen
        name="Fade"
        component={GenericScreen}
        options={{ animation: "fade" }}
      />
      <AnimationStack.Screen
        name="ZoomFade"
        component={GenericScreen}
        options={{ animation: "zoom-fade" }}
      />
      <AnimationStack.Screen
        name="FadeRight"
        component={GenericScreen}
        options={{ animation: "fade-from-right" }}
      />
      <AnimationStack.Screen
        name="FadeLeft"
        component={GenericScreen}
        options={{ animation: "fade-from-left" }}
      />
      <AnimationStack.Screen
        name="FadeTop"
        component={GenericScreen}
        options={{ animation: "fade-from-top" }}
      />
      <AnimationStack.Screen
        name="FadeBottom"
        component={GenericScreen}
        options={{ animation: "fade-from-bottom" }}
      />

      <AnimationStack.Screen
        name="Flip"
        component={GenericScreen}
        options={{ animation: "flip" }}
      />
      <AnimationStack.Screen
        name="SlideRight"
        component={GenericScreen}
        options={{
          animation: "default",
          pageClassName: "shadow-md",
        }}
      />
      <AnimationStack.Screen
        name="SlideBottom"
        component={GenericScreen}
        options={{ animation: "slide-from-bottom" }}
      />
      <AnimationStack.Screen
        name="SlideLeft"
        component={GenericScreen}
        options={{ animation: "slide-from-left" }}
      />
      <AnimationStack.Screen
        name="SlideTop"
        component={GenericScreen}
        options={{ animation: "slide-from-top" }}
      />
    </AnimationStack.Navigator>
  ),
};

// --- 4. Mail App Example ---
type MailStackParamList = {
  Inbox: undefined;
  Email: { emailId: number; subject: string };
};
const MailStack = createStackNavigator<MailStackParamList>();
const emails = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  from: ["Alice", "Bob", "Charlie", "Diana", "Ethan"][i % 5],
  subject: [
    "Project Update",
    "Lunch Plans",
    "Weekly Report",
    "Design Feedback",
    "Q4 Roadmap",
  ][i % 5],
}));
const InboxScreen = () => {
  const navigation = useNavigation<MailStackParamList>();
  const { scrollContainerRef } = useNavigation();
  return (
    <ElasticScrollArea scrollbarVisibility="hidden" ref={scrollContainerRef}>
      <div className="pt-[140px] p-4">
        {emails.map((email) => (
          <Item
            key={email.id}
            variant="ghost"
            onClick={() =>
              navigation.navigate("Email", {
                emailId: email.id,
                subject: email.subject,
              })
            }
            className="cursor-pointer "
          >
            <ItemContent>
              <ItemTitle>{email.from}</ItemTitle>
              <Typography variant="body-small" muted={true}>
                {email.subject}
              </Typography>
            </ItemContent>
          </Item>
        ))}
      </div>
    </ElasticScrollArea>
  );
};
const EmailScreen = () => {
  const navigation = useNavigation<MailStackParamList>();
  const route = useRoute<MailStackParamList, "Email">();
  const email = emails.find((e) => e.id === route.params.emailId);
  return (
    <div className="p-6 pt-[70px]" ref={navigation.scrollContainerRef}>
      <Typography variant="title-small">{email?.subject}</Typography>
      <Typography variant="body-small" muted={true} className="!mt-2">
        From: {email?.from}
      </Typography>
      <Typography variant="body-medium">
        This is the body of the email. Lorem ipsum dolor sit amet, consectetur
        adipiscing elit...
      </Typography>
    </div>
  );
};

export const FullAppExample: StoryObj = {
  name: "4. Full App Example (Mail Client)",
  render: () => (
    <MailStack.Navigator
      screenOptions={{
        animation: "fade-from-bottom",
      }}
      initialRouteName="Inbox"
    >
      <MailStack.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          headerTitle: "Inbox",
          headerRight: () => (
            <IconButton
              variant="ghost"
              onClick={() => alert("Compose new email!")}
            >
              <Mail />
            </IconButton>
          ),
          appBarProps: {
            size: "lg",
            scrollBehavior: "conditionally-sticky",
            largeHeaderRowHeight: 64,
          },
          headerExpanded: () => (
            <Input
              variant="secondary"
              shape="full"
              startContent={<Search className="h-5 w-5 text-gray-500" />}
              placeholder="Search mail..."
            />
          ),
        }}
      />
      <MailStack.Screen
        name="Email"
        component={EmailScreen}
        options={({
          route,
        }: {
          route: RouteProp<MailStackParamList, "Email">;
        }) => ({
          title: route.params.subject,
        })}
      />
    </MailStack.Navigator>
  ),
};
