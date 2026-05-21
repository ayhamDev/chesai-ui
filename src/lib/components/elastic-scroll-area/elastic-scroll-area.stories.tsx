// src/lib/components/elastic-scroll-area/elastic-scroll-area.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, Home, Library, Menu, Search, Send } from "lucide-react";
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
    dimmingEdges: { control: "boolean" },
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
    <div className="w-96 h-[600px] rounded-2xl border border-outline-variant shadow-lg overflow-hidden relative bg-graphite-background text-white">
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
    dimmingEdges: true,
    onRefresh: simulateRefresh,
  },
  render: (args) => (
    <ShallowRouter>
      <RenderWithAppBarAndBottomTabs elasticScrollArgs={args} />
    </ShallowRouter>
  ),
};

// --- ADDITIONAL EXAMPLES ---

export const HorizontalTags: Story = {
  name: "2. Horizontal Dimming Tags",
  args: {
    orientation: "horizontal",
    elasticity: true,
    dimmingEdges: true,
    scrollbarVisibility: "hidden",
  },
  render: (args) => {
    const categories = [
      "All Topics",
      "Design Systems",
      "React Hooks",
      "Animations",
      "Tailwind CSS",
      "Framer Motion",
      "TypeScript",
      "Web Accessibility",
      "Next.js",
      "State Management",
    ];

    return (
      <div className="w-96 p-4 rounded-xl border border-outline-variant bg-graphite-background shadow-md">
        <Typography variant="title-small" className="mb-3 text-white">
          Browse Categories
        </Typography>
        <ElasticScrollArea {...args} className="w-full h-12">
          <div className="flex gap-2 pr-6">
            {categories.map((category) => (
              <button
                key={category}
                className="whitespace-nowrap rounded-full bg-graphite-secondary px-4 py-2 text-xs font-medium text-white hover:bg-opacity-80 transition"
              >
                {category}
              </button>
            ))}
          </div>
        </ElasticScrollArea>
      </div>
    );
  },
};

export const ChatLayout: Story = {
  name: "3. Chat Window (Dimming Edges)",
  args: {
    orientation: "vertical",
    elasticity: true,
    dimmingEdges: true,
    scrollbarVisibility: "scroll",
  },
  render: (args) => {
    const initialMessages = [
      {
        id: 1,
        text: "Hey! How is the new elastic scroll area working?",
        sender: "other",
      },
      {
        id: 2,
        text: "It's working nicely, the bounce feedback is smooth.",
        sender: "me",
      },
      {
        id: 3,
        text: "Did you manage to add the custom dimming edges?",
        sender: "other",
      },
      {
        id: 4,
        text: "Yes, they automatically fade out near the boundaries using dynamic CSS masks.",
        sender: "me",
      },
      {
        id: 5,
        text: "Awesome! That makes it look highly polished.",
        sender: "other",
      },
      {
        id: 6,
        text: "Check out this simulated chat feed to test the scrolling transitions.",
        sender: "other",
      },
      {
        id: 7,
        text: "Adding custom indicators is fully supported too.",
        sender: "me",
      },
    ];

    return (
      <div className="w-80 h-[450px] rounded-2xl border border-outline-variant bg-graphite-background shadow-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-outline-variant bg-graphite-secondary flex items-center justify-between">
          <div>
            <Typography variant="body-medium" className="font-bold text-white">
              Jane Doe
            </Typography>
            <Typography variant="body-small" className="text-gray-400">
              Online
            </Typography>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <ElasticScrollArea {...args}>
            <div className="p-4 space-y-4">
              {initialMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "me"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-graphite-secondary text-white rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </ElasticScrollArea>
        </div>

        <div className="p-3 bg-graphite-secondary border-t border-outline-variant flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-graphite-background text-xs rounded-full px-4 outline-none border border-outline-variant text-white"
          />
          <button className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition">
            <Send size={14} />
          </button>
        </div>
      </div>
    );
  },
};
