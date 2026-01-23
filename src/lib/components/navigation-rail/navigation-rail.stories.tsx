import type { Meta, StoryObj } from "@storybook/react";
import { Compass, Home, Library, Plus } from "lucide-react";
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
      options: ["primary", "secondary", "ghost"],
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
      <div className="h-[600px] w-full bg-graphite-background flex">
        <Story />
      </div>
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
          label="label"
        >
          Label
        </NavigationRail.FAB>

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
      <main className="flex-1 p-6 flex flex-col bg-graphite-background">
        <header className="h-16 border-b border-graphite-border flex items-center px-4 gap-4 bg-graphite-card rounded-xl mb-4">
          <Typography variant="h4" className="capitalize">
            {activeTab === "/" ? initialTab : activeTab.substring(1)}
          </Typography>
        </header>
        <div className="flex-1 flex items-center justify-center text-graphite-foreground/50 rounded-xl bg-graphite-card">
          <Typography variant="large">Main Content Area</Typography>
        </div>
      </main>
    </>
  );
};

export const Default: Story = {
  name: "1. Default (Push on Desktop)",
  args: {
    variant: "secondary",
    shape: "minimal",
    bordered: true,
    itemVariant: "primary"
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
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Renders the navigation rail with a ShallowRouter context.
   * The ShallowRouter context is necessary for the rail to determine the active tab.
   * @param {object} args - Arguments passed from the story.
   * @returns {JSX.Element} - The rendered navigation rail.
   */
  /*******  1731affb-b1ad-4ed0-89c2-e80713fc5c32  *******/
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithLayout {...args} />
    </ShallowRouter>
  ),
};
