import type { Meta, StoryObj } from "@storybook/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../button";
import { ButtonGroup } from "../button-group";
import { Card } from "../card";
import { IconButton } from "../icon-button";
import { Typography } from "../typography";
import {
  ShallowPage,
  ShallowRoute,
  ShallowRouter,
  ShallowSwitch,
  useRouter,
  useRouterOptions,
} from "./index";

const meta: Meta<typeof ShallowRouter> = {
  title: "Components/Navigators/ShallowRouter",
  component: ShallowRouter,
  subcomponents: { ShallowRoute, ShallowSwitch, ShallowPage },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A provider for the `useShallowRouter` hook. It enables shallow, client-side navigation using either URL search parameters or the URL pathname, without causing a full page reload. It also includes declarative components like `<ShallowRoute>`, `<ShallowSwitch>`, and `<ShallowPage>` for building navigable UIs.",
      },
    },
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["search", "pathname"],
    },
    paramName: {
      control: "text",
      if: { arg: "mode", eq: "search" },
    },
    basePath: {
      control: "text",
      if: { arg: "mode", eq: "pathname" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ShallowRouter>;

// --- Demo Components ---

const NavBar = () => {
  const { path, push } = useRouter();
  const { mode } = useRouterOptions();

  return (
    <div className="mb-4 p-4 bg-gray-100 rounded-xl">
      <Typography variant="body-small" className="font-bold mb-2">
        Navigation (mode: {mode})
      </Typography>
      <ButtonGroup shape="minimal">
        <Button
          size="sm"
          variant={path === "/" ? "primary" : "secondary"}
          onClick={() => push("/")}
        >
          Home
        </Button>
        <Button
          size="sm"
          variant={path === "/profile" ? "primary" : "secondary"}
          onClick={() => push("/profile")}
        >
          Profile
        </Button>
        <Button
          size="sm"
          variant={path === "/settings" ? "primary" : "secondary"}
          onClick={() => push("/settings")}
        >
          Settings
        </Button>
      </ButtonGroup>
    </div>
  );
};

const Header = ({ title }: { title: string }) => {
  const { path, goBack } = useRouter();
  return (
    <div className="flex items-center gap-2 mb-4">
      {path !== "/" && (
        <IconButton
          variant="ghost"
          size="sm"
          onClick={goBack}
          aria-label="Go back"
        >
          <ArrowLeft />
        </IconButton>
      )}
      <Typography variant="title-small">{title}</Typography>
    </div>
  );
};

// --- Stories ---

export const BasicRouting: Story = {
  name: "1. Basic Routing with <ShallowRoute>",
  args: {
    mode: "search",
  },
  render: (args) => (
    <ShallowRouter {...args}>
      <Card className="w-96">
        <NavBar />
        <div className="mt-4">
          <ShallowRoute path="/">
            <Typography variant="large">Welcome Home!</Typography>
            <Typography variant="body-medium">
              This content is rendered when the path is exactly `/`.
            </Typography>
          </ShallowRoute>
          <ShallowRoute path="/profile">
            <Typography variant="large">User Profile</Typography>
            <Typography variant="body-medium">
              This is the user's profile page content.
            </Typography>
          </ShallowRoute>
          <ShallowRoute path="/settings">
            <Typography variant="large">Application Settings</Typography>
            <Typography variant="body-medium">
              Adjust your application settings here.
            </Typography>
          </ShallowRoute>
        </div>
      </Card>
    </ShallowRouter>
  ),
};

export const PageSwitching: Story = {
  name: "2. Page Switching with <ShallowSwitch>",
  args: {
    mode: "search",
    paramName: "view",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `<ShallowSwitch>` component manages a collection of `<ShallowPage>` components. It ensures only the active page is rendered, switching instantly as the route changes.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter {...args}>
      <Card className="w-96 h-80 flex flex-col">
        <NavBar />
        <div className="flex-1 relative">
          <ShallowSwitch>
            <ShallowPage path="/">
              <Header title="Home" />
              <Typography variant="body-medium">
                This is the main landing page. Navigate to other sections using
                the buttons above.
              </Typography>
            </ShallowPage>
            <ShallowPage path="/profile">
              <Header title="Profile" />
              <Typography variant="body-medium">
                Here you can view and edit your profile details. All changes are
                saved automatically.
              </Typography>
            </ShallowPage>
            <ShallowPage path="/settings">
              <Header title="Settings" />
              <Typography variant="body-medium">
                Customize your experience. Toggle notifications, change your
                theme, and set your language.
              </Typography>
            </ShallowPage>
          </ShallowSwitch>
        </div>
      </Card>
    </ShallowRouter>
  ),
};
