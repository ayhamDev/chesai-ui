// src/lib/components/elastic-scroll-area/elastic-scroll-area.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, Home, Library, Menu, Search } from "lucide-react";
import React, { useRef, useState } from "react";
import { AppBar } from "../appbar";
import { BottomTabs } from "../bottom-tabs";
import { IconButton } from "../icon-button";
import { Input } from "../input";
import { ShallowRouter, useRouter } from "../shallow-router";
import { Typography } from "../typography";
import { ElasticScrollArea } from "./index";

const meta: Meta<typeof ElasticScrollArea> = {
  title: "Components/ElasticScrollArea",
  component: ElasticScrollArea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["vertical", "horizontal"],
    },
    elasticity: { control: "boolean" },
    scrollbarVisibility: {
      control: "select",
      options: ["auto", "always", "scroll", "hidden", "visible"],
    },
    pullToRefresh: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ElasticScrollArea>;

const DummyContent = () => (
  <main className="p-6">
    <Typography variant="title-medium">Scroll Me</Typography>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-graphite-secondary" />
      ))}
    </div>
  </main>
);

const simulateRefresh = () => {
  return new Promise((resolve) => setTimeout(resolve, 2000));
};

const RenderWithAppBarAndBottomTabs = ({
  elasticScrollArgs,
}: {
  elasticScrollArgs: any;
}) => {
  const { path: activeTab, push: onTabPress } = useRouter();
  const [isTabsVisible, setIsTabsVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-96 h-[600px] rounded-2xl border border-outline-variant shadow-lg overflow-hidden relative bg-graphite-background">
      <AppBar
        variant="medium"
        title="Explore"
        scrollBehavior="floating"
        color="surface-container"
        leadingIcon={
          <IconButton variant="ghost" size="sm">
            <Menu />
          </IconButton>
        }
        scrollContainerRef={scrollRef}
        bottomContent={
          <div className="px-4 pb-4 w-full">
            <Input
              variant="secondary"
              shape="full"
              startContent={<Search className="h-5 w-5 text-gray-500" />}
              placeholder="Search..."
            />
          </div>
        }
      />

      <ElasticScrollArea
        {...elasticScrollArgs}
        ref={scrollRef}
        onScrollDown={() => setIsTabsVisible(false)}
        onScrollUp={() => setIsTabsVisible(true)}
      >
        {/* pt-[112px] (medium AppBar height) + ~70px (bottomContent height) = pt-[182px] */}
        <div className="pt-[182px]">
          <DummyContent />
        </div>
      </ElasticScrollArea>

      <AnimatePresence>
        {isTabsVisible && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className="absolute bottom-0 left-0 right-0 z-50"
          >
            <BottomTabs.Navigator
              mode="detached"
              shape="minimal"
              activeTab={activeTab === "/" ? "home" : activeTab.substring(1)}
              onTabPress={(tab) => onTabPress(`/${tab}`)}
            >
              <BottomTabs.Screen
                name="home"
                label="Home"
                icon={() => <Home size={24} />}
              />
              <BottomTabs.Screen
                name="browse"
                label="Browse"
                icon={() => <Compass size={24} />}
              />
              <BottomTabs.Screen
                name="library"
                label="Library"
                icon={() => <Library size={24} />}
              />
            </BottomTabs.Navigator>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const WithAppBarAndBottomTabs: Story = {
  name: "1. Advanced App Layout",
  args: {
    orientation: "vertical",
    elasticity: true,
    pullToRefresh: true,
    onRefresh: simulateRefresh,
  },
  render: (args) => (
    <ShallowRouter>
      <RenderWithAppBarAndBottomTabs elasticScrollArgs={args} />
    </ShallowRouter>
  ),
};
