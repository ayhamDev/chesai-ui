import type { Meta, StoryObj } from "@storybook/react";
import { Compass, Home, Library, Radio } from "lucide-react";
import React from "react";
import { ShallowRouter, useRouter } from "../shallow-router";
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
    variant: {
      control: "select",
      options: ["contained", "full-width"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      if: { arg: "variant", eq: "contained" },
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

export const Contained: Story = {
  name: "1. Contained (Floating)",
  args: {
    variant: "contained",
    shape: "full",
  },
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};

export const FullWidth: Story = {
  name: "2. Full Width (Animated Label)",
  args: {
    variant: "full-width",
  },
  parameters: {
    docs: {
      description: {
        story:
          "In the `full-width` variant, the active tab's label animates horizontally, creating a common native mobile pattern.",
      },
    },
  },
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};

export const ContainedMinimalShape: Story = {
  name: "3. Contained (Minimal Shape)",
  args: {
    variant: "contained",
    shape: "minimal",
  },
  render: (args) => (
    <ShallowRouter paramName="tab">
      <RenderWithRouter {...args} />
    </ShallowRouter>
  ),
};
