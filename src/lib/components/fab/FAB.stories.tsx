import type { Meta, StoryObj } from "@storybook/react";
import { CreditCard, LogOut, Plus, Settings, User } from "lucide-react";
import { useState } from "react";
import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { FAB } from "./index";

const meta: Meta<typeof FAB> = {
  title: "Components/Buttons/FAB",
  component: FAB,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "outline"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    isExtended: { control: "boolean" },
    disabled: { control: "boolean" },
    onClick: { action: "clicked" },
  },
  args: {
    icon: <Plus className="h-7 w-7" />,
    children: "Create New",
    "aria-label": "Create New Item",
    variant: "primary",
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isExtended: false,
    shape: "full",
  },
};

export const AllVariants: Story = {
  name: "All Variants",
  render: (args) => (
    <div className="flex flex-col items-start space-y-6">
      <div className="flex items-center gap-4">
        <FAB {...args} variant="primary" isExtended={false} />
        <FAB {...args} variant="primary" isExtended={true} />
        <span className="text-sm text-gray-500">Primary</span>
      </div>

      <div className="flex items-center gap-4">
        <FAB {...args} variant="secondary" isExtended={false} />
        <FAB {...args} variant="secondary" isExtended={true} />
        <span className="text-sm text-gray-500">Secondary</span>
      </div>

      <div className="flex items-center gap-4">
        <FAB {...args} variant="tertiary" isExtended={false} />
        <FAB {...args} variant="tertiary" isExtended={true} />
        <span className="text-sm text-gray-500">Tertiary</span>
      </div>

      <div className="flex items-center gap-4">
        <FAB {...args} variant="outline" isExtended={false} />
        <FAB {...args} variant="outline" isExtended={true} />
        <span className="text-sm text-gray-500">Outline</span>
      </div>
    </div>
  ),
};

export const XLSize: Story = {
  name: "Extra Large (XL)",
  args: {
    size: "xl",
    variant: "primary",
    icon: <Plus className="h-10 w-10" />,
    children: "Big Action",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The XL size is significantly larger (96px), useful for primary screen actions or emphasized calls to action.",
      },
    },
  },
  render: (args) => (
    <div className="flex items-center gap-6">
      <FAB {...args} isExtended={false} />
      <FAB {...args} isExtended={true} />
    </div>
  ),
};

export const AllSizes: Story = {
  name: "All Sizes",
  render: (args) => (
    <div className="flex items-end gap-6">
      <FAB {...args} size="sm" isExtended={false} />
      <FAB {...args} size="md" isExtended={false} />
      <FAB {...args} size="lg" isExtended={false} />
      <FAB {...args} size="xl" isExtended={false} />
    </div>
  ),
};

export const AllShapes: Story = {
  name: "All Shapes",
  render: (args) => (
    <div className="flex flex-col items-start space-y-6">
      <div className="flex items-center gap-4">
        <FAB {...args} shape="full" isExtended={false} />
        <FAB {...args} shape="full" isExtended={true} />
        <span className="text-sm text-gray-500">Full</span>
      </div>
      <div className="flex items-center gap-4">
        <FAB {...args} shape="minimal" isExtended={false} />
        <FAB {...args} shape="minimal" isExtended={true} />
        <span className="text-sm text-gray-500">Minimal</span>
      </div>
      <div className="flex items-center gap-4">
        <FAB {...args} shape="sharp" isExtended={false} />
        <FAB {...args} shape="sharp" isExtended={true} />
        <span className="text-sm text-gray-500">Sharp</span>
      </div>
    </div>
  ),
};

export const InteractiveAnimation: Story = {
  name: "Interactive Animation",
  parameters: {
    docs: {
      description: {
        story:
          "This story uses Framer Motion's layout animations for a perfectly smooth transition between extended and collapsed states.",
      },
    },
  },
  render: (args) => {
    const [isExtended, setIsExtended] = useState(false);

    return (
      <div className="space-y-4 flex flex-col">
        <p>Click the button below to see the smooth FAB animation.</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsExtended((prev) => !prev)}
        >
          {isExtended ? "Collapse FAB" : "Extend FAB"}
        </Button>
        <div>
          <FAB {...args} isExtended={isExtended} />
        </div>
      </div>
    );
  },
};

export const WithDropdownMenu: Story = {
  name: "With Dropdown Menu",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story:
          "A FAB can be used as a trigger for a Dropdown Menu. Wrap the FAB with the `DropdownMenuTrigger` component and pass the `asChild` prop.",
      },
    },
  },
  render: (args) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Render the FAB as the trigger, using args from Storybook controls */}
        <FAB {...args} isExtended={false} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing</span>
          <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
