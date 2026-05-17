// src/lib/components/code-view/CodeView.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import {
  AlignLeft,
  Check,
  Copy,
  FileText,
  GitBranch,
  Play,
  Scissors,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { ThemeProvider, useTheme } from "../../context/ThemeProvider";
import { Button } from "../button";
import { Card } from "../card";
import { ContextMenu } from "../context-menu";
import { toast, Toaster } from "../toast";
import { Typography } from "../typography";
import { CodeEditor } from "./index";
import { IconButton } from "../icon-button";
import { Badge } from "../badge";

const ThemeToggleWrapper = ({ children }: { children: React.ReactNode }) => {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto">
      <div className="flex justify-end items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
        <Typography variant="body-small">
          Theme Context: <strong>{resolvedTheme}</strong>
        </Typography>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          Toggle Theme
        </Button>
      </div>
      {children}
    </div>
  );
};

const meta: Meta<typeof CodeEditor> = {
  title: "Components/Data/CodeEditor",
  component: CodeEditor,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A full-featured code and diff editor powered by Monaco Editor (VS Code). Now includes a built-in toolbar with Copy, Compare view toggles, Custom Toolbar Elements, and Collapsible capabilities.",
      },
    },
  },
  argTypes: {
    language: {
      control: "select",
      options: ["typescript", "javascript", "json", "html", "css", "python"],
    },
    isDiff: { control: "boolean" },
    readOnly: { control: "boolean" },
    collapsible: { control: "boolean" },
    enableCopy: { control: "boolean" },
    toolbarSize: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    variant: {
      control: "select",
      options: ["primary", "secondary", "surface", "ghost"],
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="system">
        <ThemeToggleWrapper>
          <Toaster />
          <Story />
        </ThemeToggleWrapper>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CodeEditor>;

const INITIAL_CODE = `import React from 'react';
import { Button } from '@/components/button';

export const App = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div className="p-4">
      <h1>Counter: {count}</h1>
      <Button onClick={() => setCount(c => c + 1)}>
        Increment
      </Button>
    </div>
  );
};
`;

const MODIFIED_CODE = `import React, { useState } from 'react';
import { Button } from '@/components/button';
import { toast } from '@/components/toast';

export const App = () => {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    setCount(c => c + 1);
    toast.success("Incremented!");
  };

  return (
    <div className="p-8 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Counter: {count}</h1>
      <Button variant="primary" onClick={handleIncrement}>
        Increment Counter
      </Button>
    </div>
  );
};
`;

export const EditorMode: Story = {
  name: "1. Editing Mode",
  args: {
    collapsible: true, // Show off collapsible
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [code, setCode] = useState(INITIAL_CODE);

    return (
      <CodeEditor
        {...args}
        value={code}
        onChange={(v) => setCode(v || "")}
        fileName="App.tsx"
        language="typescript"
        height={400}
        shadow="sm"
      />
    );
  },
};

export const GitDiff: Story = {
  name: "2. Git Changes (Diff View)",
  args: {
    isDiff: true,
    original: INITIAL_CODE,
    value: MODIFIED_CODE,
    language: "typescript",
    readOnly: true,
    fileName: "src/App.tsx",
    height: 500,
    collapsible: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Passing `isDiff={true}` renders a Git Diff view. The toolbar automatically gains a toggle button so users can instantly switch between **Side-by-Side** and **Inline** diff views.",
      },
    },
  },
};

export const ToolbarSizes: Story = {
  name: "3. Toolbar Sizes",
  render: (args) => {
    return (
      <div className="flex flex-col gap-6">
        <CodeEditor
          {...args}
          value="const size = 'small';"
          fileName="small.ts"
          toolbarSize="sm"
          height={100}
        />
        <CodeEditor
          {...args}
          value="const size = 'medium';"
          fileName="medium.ts"
          toolbarSize="md"
          height={100}
        />
        <CodeEditor
          {...args}
          value="const size = 'large';"
          fileName="large.ts"
          toolbarSize="lg"
          height={100}
        />
      </div>
    );
  },
};

export const CustomToolbarContent: Story = {
  name: "4. Custom Toolbar Content",
  parameters: {
    docs: {
      description: {
        story:
          "Pass elements to `toolbarContent` to insert custom buttons, badges, or toggles straight into the editor toolbar. (Clicks inside custom content safely prevent the editor from collapsing).",
      },
    },
  },
  render: (args) => {
    return (
      <CodeEditor
        {...args}
        value={INITIAL_CODE}
        fileName="deploy.config.ts"
        toolbarSize="lg"
        collapsible
        height={400}
        toolbarContent={
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              shape="minimal"
              className="font-mono hidden sm:inline-flex"
            >
              <GitBranch className="w-3 h-3 mr-1" /> feature/new-layout
            </Badge>
            <IconButton
              size="xs"
              variant="outline"
              onClick={() => toast.info("Formatting code...")}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </IconButton>
            <Button
              size="xs"
              variant="primary"
              startIcon={<Play className="w-3 h-3" />}
              onClick={() => toast.success("Running deployment script...")}
            >
              Run
            </Button>
          </div>
        }
      />
    );
  },
};

export const WithContextMenu: Story = {
  name: "5. With Context Menu",
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [code, setCode] = useState(INITIAL_CODE);

    const MyContextMenu = (
      <ContextMenu.Content className="w-56">
        <ContextMenu.Item onClick={() => toast("Running code...")}>
          <Play className="mr-2 h-4 w-4" /> Run Script
          <ContextMenu.Shortcut>⌘R</ContextMenu.Shortcut>
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item onClick={() => navigator.clipboard.writeText(code)}>
          <Copy className="mr-2 h-4 w-4" /> Copy Entire File
        </ContextMenu.Item>
        <ContextMenu.Item>
          <Scissors className="mr-2 h-4 w-4" /> Cut
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item className="text-error focus:bg-error/10">
          <Trash2 className="mr-2 h-4 w-4" /> Delete File
        </ContextMenu.Item>
      </ContextMenu.Content>
    );

    return (
      <div className="flex flex-col gap-4">
        <Card variant="secondary" className="p-4" shape="minimal">
          <Typography variant="body-small" muted>
            Right-click anywhere inside the editor below to see the custom
            Context Menu instead of the default Monaco menu.
          </Typography>
        </Card>
        <CodeEditor
          {...args}
          value={code}
          onChange={(v) => setCode(v || "")}
          fileName="main.ts"
          language="typescript"
          contextMenu={MyContextMenu}
        />
      </div>
    );
  },
};
