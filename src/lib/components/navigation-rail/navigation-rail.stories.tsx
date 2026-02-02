import type { Meta, StoryObj } from "@storybook/react";
import { Compass, Home, Library, Plus } from "lucide-react";
import { LayoutProvider } from "../../context/layout-context";
import { LayoutDirectionToggle } from "../layout-toggle";
import { ShallowRouter, useRouter } from "../shallow-router";
import { Typography } from "../typography";
import { NavigationRail } from "./index";

const meta: Meta<typeof NavigationRail.Navigator> = {
  title: "Components/Navigators/NavigationRail",
  component: NavigationRail.Navigator,
  subcomponents: { Screen: NavigationRail.Screen },
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A vertical navigation component, ideal for primary navigation in apps with 2-5 top-level destinations. It's collapsed by default and expands on hover (desktop) or on tap (mobile) to reveal labels. On mobile, it acts as an overlay; on desktop, it pushes adjacent content.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
    },
    itemVariant: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "ghost"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    bordered: {
      control: "boolean",
    },
    activeTab: { control: false },
    onTabPress: { action: "tabPressed" },
  },
  decorators: [
    (Story) => (
      <LayoutProvider>
        <div className="h-[600px] w-full bg-graphite-background flex relative overflow-hidden">
          <div className="absolute top-4 right-4 z-50">
            <LayoutDirectionToggle />
          </div>
          <Story />
        </div>
      </LayoutProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NavigationRail.Navigator>;

// Helper to render the rail with a router and mock content
const RenderWithLayout = (args: any) => {
  const { path: activeTab, push: onTabPress } = useRouter();
  const iconSize = 24;
  const initialTab = "home";

  return (
    <>
      <NavigationRail.Navigator
        {...args}
        activeTab={activeTab === "/" ? initialTab : activeTab.substring(1)}
        onTabPress={(tab) => onTabPress(`/${tab}`)}
      >
        <NavigationRail.FAB
          variant="secondary"
          icon={<Plus size={20} />}
          label="Create"
        />

        <NavigationRail.Screen
          name="home"
          label="Home"
          icon={() => <Home size={iconSize} />}
        />
        <NavigationRail.Screen
          name="browse"
          label="Browse"
          icon={() => <Compass size={iconSize} />}
        />
        <NavigationRail.Screen
          name="library"
          label="Library"
          icon={() => <Library size={iconSize} />}
        />
      </NavigationRail.Navigator>
      <main className="flex-1 p-6 flex flex-col bg-graphite-background transition-all duration-300">
        <header className="h-16 border-b border-graphite-border flex items-center px-4 gap-4 bg-graphite-card rounded-xl mb-4">
          <Typography variant="h4" className="capitalize">
            {activeTab === "/" ? initialTab : activeTab.substring(1)}
          </Typography>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-graphite-foreground/50 rounded-xl bg-graphite-card p-8 text-center gap-4">
          <Typography variant="large">Main Content Area</Typography>
          <Typography variant="body-small">
            Toggle the direction button in the top right corner to test RTL
            behavior. <br /> Note how the Rail border, border-radius, and FAB
            animation flip correctly.
          </Typography>
        </div>
      </main>
    </>
  );
};

export const Default: Story = {
  name: "1. Default (Push on Desktop)",
  args: {
    variant: "ghost",
    shape: "minimal",
    bordered: false,
    itemVariant: "primary",
  },
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithLayout {...args} />
    </ShallowRouter>
  ),
};

export const OverlayOnMobile: Story = {
  name: "2. Overlay on Mobile",
  args: {
    ...Default.args,
    variant: "primary",
    shape: "full",
    bordered: false,
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "On smaller viewports, the rail automatically switches to an 'overlay' behavior. Tapping the menu icon expands it over the content, and a semi-transparent backdrop appears. Tapping the backdrop closes the rail.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithLayout {...args} />
    </ShallowRouter>
  ),
};
