import type { Meta, StoryObj } from "@storybook/react";
import { Compass, Home, Library, Radio } from "lucide-react";
import { ShallowRouter, useRouter } from "../shallow-router";
import { Typography } from "../typography";
import { BottomTabs } from "./index";

const meta: Meta<typeof BottomTabs.Navigator> = {
  title: "Components/Navigators/BottomTabs",
  component: BottomTabs.Navigator,
  subcomponents: { Screen: BottomTabs.Screen },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A responsive and animated bottom navigation component. It integrates with any routing library by exposing `activeTab` and `onTabPress` props.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "surface", "ghost"],
      description: "Background color variant of the tab bar.",
    },
    itemVariant: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "ghost"],
      description: "Visual style of the active tab indicator.",
    },
    mode: {
      control: "select",
      options: ["attached", "detached"],
      description: "Controls the container style: full-width or floating.",
    },
    itemLayout: {
      control: "select",
      options: ["stacked", "inline"],
      description:
        "Stacked: Labels always visible. Inline: Labels show only when active (Shift pattern).",
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description:
        "Sets the border-radius for the container and the active item indicator.",
    },
    shadow: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
      description: "Sets the shadow depth for the `detached` mode.",
      if: { arg: "mode", eq: "detached" },
    },
    bordered: {
      control: "boolean",
      description: "Toggles the top border for the `attached` mode.",
      if: { arg: "mode", eq: "attached" },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Sets the height of the container.",
    },
    activeTab: { control: false },
    onTabPress: { action: "tabPressed" },
  },
};

export default meta;
type Story = StoryObj<typeof BottomTabs.Navigator>;

const RenderWithRouter = (args: any) => {
  const { path: activeTab, push: onTabPress } = useRouter();
  const iconSize = 24;
  const initialTab = "home";

  return (
    <div className="w-96">
      <BottomTabs.Navigator
        {...args}
        activeTab={activeTab === "/" ? initialTab : activeTab.substring(1)}
        onTabPress={(tab) => onTabPress(`/${tab}`)}
      >
        <BottomTabs.Screen
          name="home"
          label="Home"
          icon={() => <Home size={iconSize} />}
        />
        <BottomTabs.Screen
          name="browse"
          label="Browse"
          icon={() => <Compass size={iconSize} />}
        />
        <BottomTabs.Screen
          name="radio"
          label="Radio"
          icon={() => <Radio size={iconSize} />}
        />
        <BottomTabs.Screen
          name="library"
          label="Library"
          icon={() => <Library size={iconSize} />}
        />
      </BottomTabs.Navigator>
    </div>
  );
};

export const StackedDefault: Story = {
  name: "1. Stacked (Labels Always)",
  args: {
    mode: "attached",
    itemLayout: "stacked",
    bordered: true,
    shape: "full",
  },
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};

export const VariantCombinations: Story = {
  name: "2. Color Variants",
  render: (args) => (
    <div className="flex flex-col gap-8 w-96">
      <div>
        <Typography variant="small" className="font-bold mb-2">
          Surface BG + Primary Items
        </Typography>
        <ShallowRouter paramName="tab1">
          <RenderWithRouter
            {...args}
            variant="surface"
            itemVariant="primary"
            bordered
            shape="minimal"
          />
        </ShallowRouter>
      </div>

      <div>
        <Typography variant="small" className="font-bold mb-2">
          Primary BG + Tertiary Items
        </Typography>
        <ShallowRouter paramName="tab2">
          <RenderWithRouter
            {...args}
            variant="primary"
            itemVariant="tertiary"
            bordered={false}
            shape="full"
          />
        </ShallowRouter>
      </div>

      <div>
        <Typography variant="small" className="font-bold mb-2">
          Secondary BG + Ghost Items
        </Typography>
        <ShallowRouter paramName="tab3">
          <RenderWithRouter
            {...args}
            variant="secondary"
            itemVariant="ghost"
            bordered={false}
            shape="minimal"
          />
        </ShallowRouter>
      </div>
    </div>
  ),
};

export const InlineShift: Story = {
  name: "3. Inline (Label only when active)",
  args: {
    mode: "attached",
    itemLayout: "inline",
    bordered: true,
    shape: "full",
  },
  parameters: {
    docs: {
      description: {
        story:
          "When `itemLayout` is `inline`, it uses a 'Shift' pattern: labels are hidden for inactive tabs and slide up into view only when the tab is active.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};

export const AttachedWithShapes: Story = {
  name: "4. Attached (Shape Variants)",
  render: (args) => (
    <div className="flex flex-col gap-12">
      <div>
        <Typography variant="small" className="font-bold mb-2 text-center">
          Full Shape
        </Typography>
        <ShallowRouter paramName="tab1">
          <RenderWithRouter {...args} mode="attached" shape="full" />
        </ShallowRouter>
      </div>
      <div>
        <Typography variant="small" className="font-bold mb-2 text-center">
          Minimal Shape
        </Typography>
        <ShallowRouter paramName="tab2">
          <RenderWithRouter {...args} mode="attached" shape="minimal" />
        </ShallowRouter>
      </div>
    </div>
  ),
};

export const Detached: Story = {
  name: "5. Detached (Floating)",
  args: {
    mode: "detached",
    shape: "full",
    itemLayout: "inline",
    shadow: "lg",
    variant: "surface",
    itemVariant: "primary",
  },
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};

export const NoLabels: Story = {
  name: "6. No Labels",
  args: {
    mode: "detached",
    showLabels: false,
    shape: "full",
    shadow: "sm",
  },
  render: (args) => (
    <ShallowRouter paramName="tab_no_labels">
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};
