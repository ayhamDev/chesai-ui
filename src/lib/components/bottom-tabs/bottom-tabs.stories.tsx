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
          "A responsive and animated bottom navigation component, inspired by native mobile tab bars. It integrates with any routing library by exposing `activeTab` and `onTabPress` props.",
      },
    },
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["attached", "detached"],
      description: "Controls the container style: full-width or floating.",
    },
    itemLayout: {
      control: "select",
      options: ["stacked", "inline"],
      description: "Controls the layout animation of the active tab item.",
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
    activeTab: { control: false },
    onTabPress: { action: "tabPressed" },
  },
};

export default meta;
type Story = StoryObj<typeof BottomTabs.Navigator>;

// Helper component to render stories with routing context
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

export const AttachedDefault: Story = {
  name: "1. Attached (Default)",
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

export const AttachedWithInlineAnimation: Story = {
  name: "2. Attached (Inline Item Layout)",
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
          "When `itemLayout` is `inline`, the active tab's label animates horizontally, creating a common native mobile pattern.",
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
  name: "3. Attached (Shape Variants)",
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
      <div>
        <Typography variant="small" className="font-bold mb-2 text-center">
          Sharp Shape
        </Typography>
        <ShallowRouter paramName="tab3">
          <RenderWithRouter {...args} mode="attached" shape="sharp" />
        </ShallowRouter>
      </div>
    </div>
  ),
};

// Helper for the new story
const RenderWithRouterForMixedShapes = (args: any) => {
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
          shape="full" // Override: This item will be a circle
        />
        <BottomTabs.Screen
          name="browse"
          label="Browse"
          icon={() => <Compass size={iconSize} />}
          // No shape prop: This item will inherit "minimal" from the navigator
        />
        <BottomTabs.Screen
          name="radio"
          label="Radio"
          icon={() => <Radio size={iconSize} />}
          shape="sharp" // Override: This item will be a square
        />
        <BottomTabs.Screen
          name="library"
          label="Library"
          icon={() => <Library size={iconSize} />}
          shape="full" // Override: This item will be a circle
        />
      </BottomTabs.Navigator>
    </div>
  );
};

export const MixedItemShapes: Story = {
  name: "4. Mixed Item Shapes",
  args: {
    mode: "attached",
    shape: "minimal", // The bar itself is minimal
    bordered: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "You can override the shape for individual tab items by setting the `shape` prop on the `<BottomTabs.Screen>` component. If an item doesn't have a shape, it inherits from the parent `<BottomTabs.Navigator>`.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter paramName="tab4">
      <RenderWithRouterForMixedShapes {...args} />
    </ShallowRouter>
  ),
};

export const Detached: Story = {
  name: "5. Detached (Floating)",
  args: {
    mode: "detached",
    shape: "full",
    itemLayout: "stacked",
    shadow: "lg",
  },
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};

export const DetachedWithShadows: Story = {
  name: "6. Detached (Shadow Variants)",
  render: (args) => (
    <div className="flex flex-col gap-12">
      <div>
        <Typography variant="small" className="font-bold mb-2 text-center">
          Small Shadow (sm)
        </Typography>
        <ShallowRouter paramName="tab1">
          <RenderWithRouter {...args} mode="detached" shadow="sm" />
        </ShallowRouter>
      </div>
      <div>
        <Typography variant="small" className="font-bold mb-2 text-center">
          Medium Shadow (md)
        </Typography>
        <ShallowRouter paramName="tab2">
          <RenderWithRouter {...args} mode="detached" shadow="md" />
        </ShallowRouter>
      </div>
      <div>
        <Typography variant="small" className="font-bold mb-2 text-center">
          Large Shadow (lg)
        </Typography>
        <ShallowRouter paramName="tab3">
          <RenderWithRouter {...args} mode="detached" shadow="lg" />
        </ShallowRouter>
      </div>
    </div>
  ),
};

export const NoLabels: Story = {
  name: "7. No Labels",
  args: {
    mode: "detached",
    showLabels: false,
    shape: "full",
    shadow: "sm"
  },
  render: (args) => (
    <ShallowRouter paramName="tab_no_labels">
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};
