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
    itemLayout: {
      control: "select",
      options: ["inline", "stacked"],
      description:
        "Controls label positioning. 'stacked' permanently shows labels below icons and disables expansion.",
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    bordered: {
      control: "boolean",
    },
    forceExpanded: {
      control: "boolean",
      description: "Forces the rail to stay expanded (Desktop only).",
    },
    expandOnHover: {
      control: "boolean",
      description:
        "Expands the rail when hovering over it on desktop. If false, users must click the menu button.",
    },
    overlay: {
      control: "boolean",
      description:
        "Forces the rail to act as an overlay with a dimmed backdrop on desktop viewports, rather than pushing the main content.",
    },
    expandable: {
      control: "boolean",
      description:
        "Allow the rail to expand. If false, it remains collapsed permanently and hides the menu button.",
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
          <Typography variant="title-small" className="capitalize">
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
  name: "1. Default (Hover Expand)",
  args: {
    variant: "ghost",
    shape: "minimal",
    bordered: false,
    itemVariant: "primary",
    itemLayout: "inline",
    expandOnHover: true,
    forceExpanded: false,
    overlay: false,
    expandable: true,
  },
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithLayout {...args} />
    </ShallowRouter>
  ),
};

export const StackedMode: Story = {
  name: "2. Stacked Mode (Permanent Labels)",
  args: {
    ...Default.args,
    itemLayout: "stacked",
    variant: "secondary",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Setting `itemLayout='stacked'` permanently renders the labels beneath the icons. In this mode, the rail disables expansion entirely, making it function perfectly as a compact, fixed-width side navigation bar.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithLayout {...args} />
    </ShallowRouter>
  ),
};

export const ForceExpanded: Story = {
  name: "3. Forced Expanded (Desktop)",
  args: {
    ...Default.args,
    forceExpanded: true,
    expandOnHover: false,
    bordered: true,
    variant: "primary",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The rail remains open on desktop. The toggle button is hidden. This behaves like a persistent sidebar.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithLayout {...args} />
    </ShallowRouter>
  ),
};

export const ManualToggle: Story = {
  name: "4. Manual Toggle Only",
  args: {
    ...Default.args,
    expandOnHover: false,
    forceExpanded: false,
    variant: "secondary",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Hover expansion is disabled. The user must click the menu button to expand/collapse the rail on desktop.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithLayout {...args} />
    </ShallowRouter>
  ),
};

export const OverlayOnMobile: Story = {
  name: "5. Overlay on Mobile",
  args: {
    ...Default.args,
    variant: "primary",
    shape: "full",
    bordered: false,
    expandOnHover: false,
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "On smaller viewports, the rail automatically switches to an 'overlay' behavior regardless of desktop settings. It also intelligently forces `itemLayout='inline'` so it looks correct inside the wider drawer.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithLayout {...args} />
    </ShallowRouter>
  ),
};

export const OverlayOnDesktop: Story = {
  name: "6. Overlay on Desktop",
  args: {
    ...Default.args,
    variant: "surface",
    overlay: true,
    expandOnHover: true, // You can still hover to open the overlay!
  },
  parameters: {
    docs: {
      description: {
        story:
          "Setting `overlay={true}` forces the rail to act as an overlay (like a Drawer) on desktop viewports, appearing over the content rather than pushing it. It works cleanly with both hover and manual click triggers.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithLayout {...args} />
    </ShallowRouter>
  ),
};

export const NotExpandable: Story = {
  name: "7. Not Expandable",
  args: {
    ...Default.args,
    expandable: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Setting `expandable={false}` permanently locks the rail in its collapsed state, disabling hover expansion and hiding the toggle button entirely. Note: if you want labels visible in this state, use `itemLayout='stacked'` instead.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithLayout {...args} />
    </ShallowRouter>
  ),
};
