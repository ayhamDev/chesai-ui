import type { Meta, StoryObj } from "@storybook/react";
import {
  ChevronRight,
  CreditCard,
  LogOut,
  Mail,
  MessageSquare,
  PlusCircle,
  Settings,
  User,
  UserPlus,
} from "lucide-react";
import React, { useState } from "react";
import { Menubar } from "./index";

const meta: Meta<typeof Menubar> = {
  title: "Components/Navigators/Menubar",
  component: Menubar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A horizontal menu bar that mimics native desktop applications. **Refactored** to use a NavigationMenu at the root for fluid viewport animations, while seamlessly converting nested sub-menus into DropdownMenus to allow infinite, portal-based flyouts.",
      },
    },
  },
  argTypes: {
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "Controls the border-radius of the content popovers.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Menubar>;

const FakeWindow = ({ children }: { children: React.ReactNode }) => (
  <div className="w-[720px] h-[480px] flex flex-col shadow-2xl overflow-hidden bg-graphite-background ring-1 ring-black/5 rounded-xl border border-outline-variant/30">
    <div className="bg-graphite-card border-b border-graphite-border">
      {children}
    </div>
    <div className="flex-1 p-6 bg-graphite-background flex items-center justify-center opacity-30 text-sm font-mono">
      App Content Area (overflow-hidden)
    </div>
  </div>
);

export const Default: Story = {
  name: "1. Default Menubar",
  args: {
    shape: "minimal",
  },
  render: (args) => (
    <FakeWindow>
      <Menubar {...args}>
        <Menubar.Menu>
          <Menubar.Trigger>File</Menubar.Trigger>
          <Menubar.Content>
            <Menubar.Item>
              New Tab <Menubar.Shortcut>⌘T</Menubar.Shortcut>
            </Menubar.Item>
            <Menubar.Item>
              New Window <Menubar.Shortcut>⌘N</Menubar.Shortcut>
            </Menubar.Item>
            <Menubar.Item disabled>New Incognito Window</Menubar.Item>
            <Menubar.Separator />
            <Menubar.Item>
              Print... <Menubar.Shortcut>⌘P</Menubar.Shortcut>
            </Menubar.Item>
          </Menubar.Content>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Trigger>Edit</Menubar.Trigger>
          <Menubar.Content>
            <Menubar.Item>
              Undo <Menubar.Shortcut>⌘Z</Menubar.Shortcut>
            </Menubar.Item>
            <Menubar.Item>
              Redo <Menubar.Shortcut>⇧⌘Z</Menubar.Shortcut>
            </Menubar.Item>
            <Menubar.Separator />
            <Menubar.Item>Cut</Menubar.Item>
            <Menubar.Item>Copy</Menubar.Item>
            <Menubar.Item>Paste</Menubar.Item>
          </Menubar.Content>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Trigger>View</Menubar.Trigger>
          <Menubar.Content>
            <Menubar.Item>Reload</Menubar.Item>
            <Menubar.Item>Force Reload</Menubar.Item>
            <Menubar.Separator />
            <Menubar.Item>Toggle Fullscreen</Menubar.Item>
          </Menubar.Content>
        </Menubar.Menu>
      </Menubar>
    </FakeWindow>
  ),
};

export const KitchenSink: Story = {
  name: "2. Kitchen Sink & Sub-menus",
  args: {
    shape: "minimal",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates nested sub-menus. The main dropdown is rendered within the NavigationMenu Viewport, but the `Invite users...` sub-menu automatically switches to a DropdownMenu Portal, allowing it to escape the bounding box of the fake window.",
      },
    },
  },
  render: (args) => {
    const [showStatusBar, setShowStatusBar] = useState(true);
    const [person, setPerson] = useState("benoit");

    return (
      <FakeWindow>
        <Menubar {...args}>
          <Menubar.Menu>
            <Menubar.Trigger>Account</Menubar.Trigger>
            <Menubar.Content>
              <Menubar.Item>
                <User className="mr-2 h-4 w-4" /> Profile
                <Menubar.Shortcut>⇧⌘P</Menubar.Shortcut>
              </Menubar.Item>
              <Menubar.Item>
                <CreditCard className="mr-2 h-4 w-4" /> Billing
              </Menubar.Item>
              <Menubar.Item>
                <Settings className="mr-2 h-4 w-4" /> Settings
                <Menubar.Shortcut>⌘,</Menubar.Shortcut>
              </Menubar.Item>
              <Menubar.Separator />

              {/* Sub Menu seamlessly switching to DropdownMenu under the hood */}
              <Menubar.Sub>
                <Menubar.SubTrigger>
                  <UserPlus className="mr-2 h-4 w-4" /> Invite users...
                </Menubar.SubTrigger>
                <Menubar.Portal>
                  <Menubar.SubContent>
                    <Menubar.Item>
                      <Mail className="mr-2 h-4 w-4" /> Email
                    </Menubar.Item>
                    <Menubar.Item>
                      <MessageSquare className="mr-2 h-4 w-4" /> Message
                    </Menubar.Item>
                    <Menubar.Separator />
                    <Menubar.Item>
                      <PlusCircle className="mr-2 h-4 w-4" /> More...
                    </Menubar.Item>
                  </Menubar.SubContent>
                </Menubar.Portal>
              </Menubar.Sub>

              <Menubar.Separator />
              <Menubar.Item className="text-error hover:!bg-error/10 hover:!text-error">
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </Menubar.Item>
            </Menubar.Content>
          </Menubar.Menu>

          <Menubar.Menu>
            <Menubar.Trigger>View</Menubar.Trigger>
            <Menubar.Content>
              <Menubar.CheckboxItem
                checked={showStatusBar}
                onCheckedChange={setShowStatusBar}
              >
                Show Status Bar
              </Menubar.CheckboxItem>
              <Menubar.Separator />
              <Menubar.RadioGroup value={person} onValueChange={setPerson}>
                <Menubar.Label>Panel Position</Menubar.Label>
                <Menubar.RadioItem value="pedro">Pedro</Menubar.RadioItem>
                <Menubar.RadioItem value="benoit">Benoit</Menubar.RadioItem>
                <Menubar.RadioItem value="colm">Colm</Menubar.RadioItem>
              </Menubar.RadioGroup>
            </Menubar.Content>
          </Menubar.Menu>
        </Menubar>
      </FakeWindow>
    );
  },
};

export const DeeplyNested: Story = {
  name: "3. Deeply Nested Portals",
  args: {
    shape: "minimal",
  },
  render: (args) => (
    <FakeWindow>
      <Menubar {...args}>
        <Menubar.Menu>
          <Menubar.Trigger>Nested Demo</Menubar.Trigger>
          <Menubar.Content>
            <Menubar.Item>Level 1 - Item A</Menubar.Item>

            <Menubar.Sub>
              <Menubar.SubTrigger>Level 1 - Open Sub...</Menubar.SubTrigger>
              <Menubar.Portal>
                <Menubar.SubContent>
                  <Menubar.Item>Level 2 - Item A</Menubar.Item>

                  <Menubar.Sub>
                    <Menubar.SubTrigger>
                      Level 2 - Open Sub...
                    </Menubar.SubTrigger>
                    <Menubar.Portal>
                      <Menubar.SubContent>
                        <Menubar.Item>Level 3 - Item A</Menubar.Item>
                        <Menubar.Item>Level 3 - Item B</Menubar.Item>
                        <Menubar.Separator />
                        <Menubar.Item>Level 3 - Item C</Menubar.Item>
                      </Menubar.SubContent>
                    </Menubar.Portal>
                  </Menubar.Sub>
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>

            <Menubar.Item>Level 1 - Item B</Menubar.Item>
          </Menubar.Content>
        </Menubar.Menu>
      </Menubar>
    </FakeWindow>
  ),
};

export const AllShapes: Story = {
  name: "4. All Shapes",
  render: () => (
    <div className="flex flex-col gap-8">
      <FakeWindow>
        <Menubar shape="full">
          <Menubar.Menu>
            <Menubar.Trigger>Full Shape</Menubar.Trigger>
            <Menubar.Content>
              <Menubar.Item>Rounded Item 1</Menubar.Item>
              <Menubar.Item>Rounded Item 2</Menubar.Item>
              <Menubar.Sub>
                <Menubar.SubTrigger>Sub Menu</Menubar.SubTrigger>
                <Menubar.Portal>
                  <Menubar.SubContent>
                    <Menubar.Item>Nested Item</Menubar.Item>
                  </Menubar.SubContent>
                </Menubar.Portal>
              </Menubar.Sub>
            </Menubar.Content>
          </Menubar.Menu>
        </Menubar>
      </FakeWindow>

      <FakeWindow>
        <Menubar shape="minimal">
          <Menubar.Menu>
            <Menubar.Trigger>Minimal Shape</Menubar.Trigger>
            <Menubar.Content>
              <Menubar.Item>Minimal Item 1</Menubar.Item>
              <Menubar.Item>Minimal Item 2</Menubar.Item>
              <Menubar.Sub>
                <Menubar.SubTrigger>Sub Menu</Menubar.SubTrigger>
                <Menubar.Portal>
                  <Menubar.SubContent>
                    <Menubar.Item>Nested Item</Menubar.Item>
                  </Menubar.SubContent>
                </Menubar.Portal>
              </Menubar.Sub>
            </Menubar.Content>
          </Menubar.Menu>
        </Menubar>
      </FakeWindow>

      <FakeWindow>
        <Menubar shape="sharp">
          <Menubar.Menu>
            <Menubar.Trigger>Sharp Shape</Menubar.Trigger>
            <Menubar.Content>
              <Menubar.Item>Sharp Item 1</Menubar.Item>
              <Menubar.Item>Sharp Item 2</Menubar.Item>
              <Menubar.Sub>
                <Menubar.SubTrigger>Sub Menu</Menubar.SubTrigger>
                <Menubar.Portal>
                  <Menubar.SubContent>
                    <Menubar.Item>Nested Item</Menubar.Item>
                  </Menubar.SubContent>
                </Menubar.Portal>
              </Menubar.Sub>
            </Menubar.Content>
          </Menubar.Menu>
        </Menubar>
      </FakeWindow>
    </div>
  ),
};
