import type { Meta, StoryObj } from "@storybook/react";
import {
  CreditCard,
  LogOut,
  Mail,
  MessageSquare,
  PlusCircle,
  Settings,
  User,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
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
          "A horizontal menu bar, similar to those found in native desktop applications. Built on Radix UI for accessibility and keyboard navigation.",
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
  <div className="w-[720px] h-[480px] flex flex-col shadow-2xl overflow-hidden bg-graphite-background ring-1 ring-black/5 rounded-xl">
    <div className="bg-graphite-card border-b border-graphite-border">
      {children}
    </div>
    <div className="flex-1 p-6 bg-graphite-background">
      <p>App Content Area</p>
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
  name: "2. Kitchen Sink",
  args: {
    shape: "minimal",
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
                <User className="mr-2" /> Profile{" "}
                <Menubar.Shortcut>⇧⌘P</Menubar.Shortcut>
              </Menubar.Item>
              <Menubar.Item>
                <CreditCard className="mr-2" /> Billing
              </Menubar.Item>
              <Menubar.Item>
                <Settings className="mr-2" /> Settings{" "}
                <Menubar.Shortcut>⌘,</Menubar.Shortcut>
              </Menubar.Item>
              <Menubar.Separator />
              <Menubar.Sub>
                <Menubar.SubTrigger>
                  <UserPlus className="mr-2" /> Invite users...
                </Menubar.SubTrigger>
                {/* --- THIS IS THE FIX --- */}
                <Menubar.Portal>
                  <Menubar.SubContent>
                    <Menubar.Item>
                      <Mail className="mr-2" /> Email
                    </Menubar.Item>
                    <Menubar.Item>
                      <MessageSquare className="mr-2" /> Message
                    </Menubar.Item>
                    <Menubar.Separator />
                    <Menubar.Item>
                      <PlusCircle className="mr-2" /> More...
                    </Menubar.Item>
                  </Menubar.SubContent>
                </Menubar.Portal>
                {/* --- END OF FIX --- */}
              </Menubar.Sub>
              <Menubar.Separator />
              <Menubar.Item>
                <LogOut className="mr-2" /> Log out
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

export const AllShapes: Story = {
  name: "3. All Shapes",
  render: () => (
    <div className="flex flex-col gap-8">
      <FakeWindow>
        <Menubar shape="full">
          <Menubar.Menu>
            <Menubar.Trigger>Full</Menubar.Trigger>
            <Menubar.Content>
              <Menubar.Item>Item 1</Menubar.Item>
              <Menubar.Item>Item 2</Menubar.Item>
            </Menubar.Content>
          </Menubar.Menu>
        </Menubar>
      </FakeWindow>
      <FakeWindow>
        <Menubar shape="minimal">
          <Menubar.Menu>
            <Menubar.Trigger>Minimal</Menubar.Trigger>
            <Menubar.Content>
              <Menubar.Item>Item 1</Menubar.Item>
              <Menubar.Item>Item 2</Menubar.Item>
            </Menubar.Content>
          </Menubar.Menu>
        </Menubar>
      </FakeWindow>
      <FakeWindow>
        <Menubar shape="sharp">
          <Menubar.Menu>
            <Menubar.Trigger>Sharp</Menubar.Trigger>
            <Menubar.Content>
              <Menubar.Item>Item 1</Menubar.Item>
              <Menubar.Item>Item 2</Menubar.Item>
            </Menubar.Content>
          </Menubar.Menu>
        </Menubar>
      </FakeWindow>
    </div>
  ),
};
