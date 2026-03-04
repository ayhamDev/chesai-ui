// src/lib/components/breadcrumb/Breadcrumb.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Slash } from "lucide-react";
import { Breadcrumb } from "./index";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Card } from "../card";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Navigators/Breadcrumb",
  component: Breadcrumb,
  subcomponents: {
    "Breadcrumb.List": Breadcrumb.List,
    "Breadcrumb.Item": Breadcrumb.Item,
    "Breadcrumb.Link": Breadcrumb.Link,
    "Breadcrumb.Page": Breadcrumb.Page,
    "Breadcrumb.Separator": Breadcrumb.Separator,
    "Breadcrumb.Ellipsis": Breadcrumb.Ellipsis,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A navigation component that helps users understand their location within a website's hierarchy. Designed with MD3 visual states.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  name: "1. Default Usage",
  render: () => (
    <Card className="px-6 py-4 min-w-[400px]">
      <Breadcrumb>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#">Components</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Page>Breadcrumb</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>
    </Card>
  ),
};

export const CustomSeparator: Story = {
  name: "2. Custom Separator",
  parameters: {
    docs: {
      description: {
        story:
          "You can pass any icon or text as a child to the `Breadcrumb.Separator` component.",
      },
    },
  },
  render: () => (
    <Card className="px-6 py-4 min-w-[400px]">
      <Breadcrumb>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator>
            <Slash className="opacity-50" />
          </Breadcrumb.Separator>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#">Settings</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator>
            <Slash className="opacity-50" />
          </Breadcrumb.Separator>
          <Breadcrumb.Item>
            <Breadcrumb.Page>Account</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>
    </Card>
  ),
};

export const CollapsedWithDropdown: Story = {
  name: "3. Collapsed (With Dropdown)",
  parameters: {
    docs: {
      description: {
        story:
          "Use the `Breadcrumb.Ellipsis` component paired with a `DropdownMenu` to handle deep hierarchies gracefully.",
      },
    },
  },
  render: () => (
    <Card className="px-6 py-4 min-w-[500px]">
      <Breadcrumb>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />

          <Breadcrumb.Item>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
                <Breadcrumb.Ellipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>Documentation</DropdownMenuItem>
                <DropdownMenuItem>Themes</DropdownMenuItem>
                <DropdownMenuItem>Layouts</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Breadcrumb.Item>

          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#">Components</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Page>Breadcrumb</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>
    </Card>
  ),
};
