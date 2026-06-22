"use client";

import type { Meta, StoryObj } from "@storybook/react";
import {
  FileText,
  Inbox,
  LayoutDashboard,
  Menu,
  MessageSquare,
  PanelLeft,
  PanelLeftClose,
  Settings,
  Star,
} from "lucide-react";
import { useState } from "react";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { Card } from "../card";
import { IconButton } from "../icon-button";
import { Item, ItemContent, ItemMedia, ItemTitle } from "../item";
import { Typography } from "../typography";
import { Resizable, useResizableState } from "./index";

const meta: Meta<typeof Resizable> = {
  title: "Components/Resizable/Features",
  component: Resizable,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;

// --- Helper Components ---

const SidebarContent = () => (
  <div className="flex flex-col h-full p-4 gap-2">
    <Typography variant="label-small" className="px-4 py-2 opacity-60">
      Navigation
    </Typography>
    <Item variant="ghost" shape="minimal" className="cursor-pointer">
      <ItemMedia>
        <Inbox size={18} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Inbox</ItemTitle>
      </ItemContent>
    </Item>
    <Item variant="ghost" shape="minimal" className="cursor-pointer">
      <ItemMedia>
        <Star size={18} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Starred</ItemTitle>
      </ItemContent>
    </Item>
    <Item variant="ghost" shape="minimal" className="cursor-pointer">
      <ItemMedia>
        <MessageSquare size={18} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Chats</ItemTitle>
      </ItemContent>
    </Item>
  </div>
);

// --- STORIES ---

export const BasicSplit: StoryObj = {
  name: "1. Basic Co-planar Split",
  render: () => (
    <div className="flex items-center justify-center p-8 bg-surface-container-lowest h-[600px]">
      <div className="w-full h-full max-w-4xl rounded-2xl border border-outline-variant/50 overflow-hidden shadow-sm bg-surface">
        <Resizable>
          <Resizable.Pane id="left-pane" defaultWidth={250}>
            <div className="h-full bg-surface-container-low">
              <SidebarContent />
            </div>
          </Resizable.Pane>

          <Resizable.Handle target="left-pane" />

          <Resizable.Pane id="main-pane" flex>
            <div className="h-full flex items-center justify-center bg-surface p-8 text-center opacity-60">
              <Typography variant="body-large">
                Drag the divider to resize the panes.
              </Typography>
            </div>
          </Resizable.Pane>
        </Resizable>
      </div>
    </div>
  ),
};

export const CustomHandleAndGaps: StoryObj = {
  name: "2. Gaps & Custom Handles (Floating Pill)",
  parameters: {
    docs: {
      description: {
        story:
          "Use the `gap` prop on the root to space panes apart. Customize the handle by disabling the divider line and adjusting the indicator's size, color, and visibility.",
      },
    },
  },
  render: () => (
    <div className="flex items-center justify-center p-8 bg-surface-container-low h-[600px]">
      <Resizable gap="md" className="w-full h-full max-w-5xl">
        <Resizable.Pane id="nav-pane" defaultWidth={300}>
          <Card
            shape="minimal"
            variant="surface-container-lowest"
            className="h-full border-none shadow-md"
          >
            <SidebarContent />
          </Card>
        </Resizable.Pane>

        <Resizable.Handle
          target="nav-pane"
          variant="pill"
          divided={false}
          alwaysShowIndicator={true}
          indicatorColor="primary"
          indicatorHeight="h-16"
          indicatorWidth="w-4"
          showIcon={false}
        />

        <Resizable.Pane id="content-pane" flex>
          <Card
            shape="minimal"
            variant="surface-container-lowest"
            className="h-full flex items-center justify-center shadow-md border-none"
          >
            <Typography variant="body-large" className="opacity-60">
              Clean, floating separated layout.
            </Typography>
          </Card>
        </Resizable.Pane>
      </Resizable>
    </div>
  ),
};

export const ThreePaneLayout: StoryObj = {
  name: "3. Three-Pane Layout",
  render: () => (
    <div className="flex items-center justify-center p-8 bg-surface-container h-[600px]">
      <div className="w-full h-full max-w-6xl rounded-2xl border border-outline-variant/50 overflow-hidden shadow-lg bg-surface">
        <Resizable>
          <Resizable.Pane id="sidebar-left" defaultWidth={240}>
            <div className="h-full bg-surface-container-low p-4">
              <Typography variant="label-small" className="opacity-50">
                FOLDERS
              </Typography>
            </div>
          </Resizable.Pane>

          <Resizable.Handle target="sidebar-left" />

          <Resizable.Pane id="middle-list" defaultWidth={350}>
            <div className="h-full bg-surface-container-lowest border-r border-outline-variant/30 p-4">
              <Typography variant="label-small" className="opacity-50">
                ITEMS
              </Typography>
            </div>
          </Resizable.Pane>

          <Resizable.Handle target="middle-list" />

          <Resizable.Pane id="detail-view" flex>
            <div className="h-full flex flex-col items-center justify-center bg-surface p-8">
              <FileText className="w-16 h-16 opacity-10 mb-4" />
              <Typography variant="body-medium" className="opacity-60">
                Select an item to view details
              </Typography>
            </div>
          </Resizable.Pane>
        </Resizable>
      </div>
    </div>
  ),
};

const MobileMenuTrigger = ({ onClick }: { onClick: () => void }) => {
  const { isCollapsed } = useResizableState("adaptive-nav");

  if (!isCollapsed) return null;

  return (
    <IconButton variant="ghost" onClick={onClick}>
      <Menu />
    </IconButton>
  );
};

export const MD3ResponsiveAdaptation: StoryObj = {
  name: "4. MD3 Sheet Adaptation (Docked with Smooth Viewport Animation)",
  parameters: {
    docs: {
      description: {
        story:
          "Rather than transitioning instantly to modal states, this design orchestrates viewport changes. Shrinking below 800px collapses the sidebar cleanly to 0px before opening the docked sheet. Re-expanding closes the sheet first and then expands the side content back to its deskop layout.",
      },
    },
  },
  render: () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
      <div className="flex items-center justify-center p-8 bg-surface-container h-[700px]">
        <div className="w-full h-full max-w-5xl rounded-2xl border border-outline-variant/50 overflow-hidden shadow-2xl bg-surface relative">
          <Resizable>
            <Resizable.Pane
              id="adaptive-nav"
              defaultWidth={280}
              collapseAt={800}
              adaptTo="docked"
              open={isSidebarOpen}
              onOpenChange={setIsSidebarOpen}
            >
              <div className="h-full bg-surface-container-low flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <Avatar src="https://i.pravatar.cc/150?img=33" size="sm" />
                    <Typography variant="title-small">Workspace</Typography>
                  </div>
                </div>
                <div className="flex-1 p-2">
                  <SidebarContent />
                </div>
              </div>
            </Resizable.Pane>

            <Resizable.Handle target="adaptive-nav" />

            <Resizable.Pane id="main-content" flex>
              <div className="h-full flex flex-col bg-surface-container-lowest">
                <div className="h-16 border-b border-outline-variant/30 flex items-center px-4 gap-4 bg-surface">
                  <MobileMenuTrigger onClick={() => setIsSidebarOpen(true)} />
                  <Typography variant="title-medium" className="font-semibold">
                    Dashboard
                  </Typography>
                </div>

                <div className="p-8 flex-1 flex flex-col items-center justify-center text-center opacity-60">
                  <LayoutDashboard className="w-16 h-16 mb-4 opacity-50" />
                  <Typography variant="title-medium" className="mb-2">
                    Animated Viewport Transition
                  </Typography>
                  <Typography variant="body-medium" className="max-w-md">
                    Resize your browser window horizontally. When dropping below
                    800px, the sidebar gracefully animates its width to 0px
                    before initializing the Bottom Sheet overlay.
                  </Typography>
                </div>
              </div>
            </Resizable.Pane>
          </Resizable>
        </div>
      </div>
    );
  },
};

const DetailsToggle = ({ onClick }: { onClick: () => void }) => {
  const { isCollapsed } = useResizableState("adaptive-details");

  if (!isCollapsed) return null;

  return (
    <IconButton variant="ghost" onClick={onClick}>
      <Settings size={20} />
    </IconButton>
  );
};

export const MD3FloatingDialogAdaptation: StoryObj = {
  name: "5. MD3 Dialog Adaptation (Floating)",
  parameters: {
    docs: {
      description: {
        story:
          "Similar to the sheet adaptation, this configuration handles dialog transitions smoothly. Drag the inverted handler to the right to dismiss the metadata view, or shrink the screen to watch it slide closed and elevate into a centered floating dialog.",
      },
    },
  },
  render: () => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    return (
      <div className="flex items-center justify-center p-8 bg-surface-container h-[700px]">
        <div className="w-full h-full max-w-5xl rounded-2xl border border-outline-variant/30 overflow-hidden shadow-2xl bg-surface">
          <Resizable>
            <Resizable.Pane
              id="main-content-area"
              flex
              className="flex flex-col h-full bg-surface-container-lowest"
            >
              <div className="h-16 border-b border-outline-variant/30 flex items-center justify-between px-4 bg-surface">
                <Typography variant="title-medium" className="font-semibold">
                  Document Editor
                </Typography>
                <DetailsToggle onClick={() => setIsDetailsOpen(true)} />
              </div>
              <div className="p-8 flex-1 flex flex-col items-center justify-center text-center opacity-60">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <Typography variant="title-medium" className="mb-2">
                  Document Workspace
                </Typography>
                <Typography variant="body-medium" className="max-w-md">
                  On desktop views, the metadata panel is nested on the right.
                  Resize below 800px or slide the handle toward the right to
                  watch it close smoothly.
                </Typography>
              </div>
            </Resizable.Pane>

            <Resizable.Handle target="adaptive-details" invert />

            <Resizable.Pane
              id="adaptive-details"
              defaultWidth={300}
              collapseAt={800}
              adaptTo="floating"
              open={isDetailsOpen}
              onOpenChange={setIsDetailsOpen}
              dismissible={true}
              minWidth={100}
            >
              <Card
                shape="sharp"
                className="h-full w-full p-6 flex flex-col gap-4 border-l border-outline-variant/20"
                variant="surface-container-low"
              >
                <Typography variant="title-medium" className="font-bold">
                  Document Metadata
                </Typography>
                <div className="flex flex-col gap-3">
                  <div>
                    <Typography variant="label-small" muted>
                      Author
                    </Typography>
                    <Typography variant="body-medium">Ayham Gm</Typography>
                  </div>
                  <div>
                    <Typography variant="label-small" muted>
                      Modified
                    </Typography>
                    <Typography variant="body-medium">
                      June 21, 2026 - 3:20 PM
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="label-small" muted>
                      Version History
                    </Typography>
                    <Typography variant="body-medium">
                      v3.4.1 (Stable)
                    </Typography>
                  </div>
                </div>
              </Card>
            </Resizable.Pane>
          </Resizable>
        </div>
      </div>
    );
  },
};

// --- STORY 6: DISMISSIBLE PANES ---

export const DismissiblePanes: StoryObj = {
  name: "6. Dismissible Panes (Drag to Close)",
  parameters: {
    docs: {
      description: {
        story:
          "Set `dismissible={true}` and a `minWidth={100}` on a `Resizable.Pane`. Dragging the handle below the minimum width threshold and releasing it will smoothly trigger the pane to animate down to 0 width. The handle vanishes while dismissed, and can be smoothly restored using standard hook helpers.",
      },
    },
  },
  render: () => {
    const SidebarToggle = () => {
      const { isCollapsed, toggle } = useResizableState("dismissible-sidebar");
      return (
        <Button
          variant={isCollapsed ? "primary" : "secondary"}
          onClick={toggle}
          startIcon={
            isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )
          }
          className="shadow-sm font-medium"
        >
          {isCollapsed ? "Open Navigation" : "Collapse Navigation"}
        </Button>
      );
    };

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-surface-container h-[650px] gap-4">
        <div className="w-full h-full max-w-4xl rounded-2xl border border-outline-variant/50 overflow-hidden shadow-lg bg-surface flex flex-col">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
            <Typography variant="title-medium" className="font-semibold">
              Project Workspace
            </Typography>
            <SidebarToggle />
          </div>

          <div className="flex-1 overflow-hidden">
            <Resizable>
              <Resizable.Pane
                id="dismissible-sidebar"
                defaultWidth={260}
                dismissible={true}
                minWidth={100}
              >
                <div className="h-full bg-surface-container-low border-r border-outline-variant/30">
                  <SidebarContent />
                </div>
              </Resizable.Pane>

              <Resizable.Handle target="dismissible-sidebar" />

              <Resizable.Pane id="workspace-main" flex>
                <div className="h-full flex flex-col items-center justify-center bg-surface p-8 text-center opacity-70">
                  <Typography variant="body-large" className="mb-2 font-medium">
                    Try dragging the sidebar handle all the way to the left
                  </Typography>
                  <Typography
                    variant="body-medium"
                    className="opacity-60 max-w-md mb-6"
                  >
                    Because `dismissible` is enabled, dragging past the 100px
                    threshold will let you snap the pane to 0 width. Release the
                    handle to watch it slide closed with a smooth
                    hardware-accelerated transition.
                  </Typography>
                </div>
              </Resizable.Pane>
            </Resizable>
          </div>
        </div>
      </div>
    );
  },
};
