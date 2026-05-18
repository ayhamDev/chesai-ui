// src/lib/components/code-editor/CodeEditor.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { AlignLeft, GitBranch, Play } from "lucide-react";
import { useState } from "react";
import { ThemeProvider, useTheme } from "../../context/ThemeProvider";
import { Button } from "../button";
import { Card } from "../card";
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
      options: [
        "tsx",
        "jsx",
        "typescript",
        "javascript",
        "json",
        "html",
        "css",
        "python",
      ],
    },
    isDiff: { control: "boolean" },
    readOnly: { control: "boolean" },
    collapsible: { control: "boolean" },
    enableCopy: { control: "boolean" },
    hideToolbar: { control: "boolean" },
    disableContextMenu: { control: "boolean" },
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
    collapsible: true,
    language: "tsx"
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

export const WithCustomActions: Story = {
  name: "5. Custom Native Context Menu",
  parameters: {
    docs: {
      description: {
        story:
          "Rather than overriding Monaco's context menu, you can inject commands directly into the native editor right-click menu using `customActions`. Try right-clicking the code!",
      },
    },
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [code, setCode] = useState(INITIAL_CODE);

    return (
      <CodeEditor
        {...args}
        value={code}
        onChange={(v) => setCode(v || "")}
        fileName="main.ts"
        language="typescript"
        customActions={[
          {
            id: "run-script",
            label: "▶ Run Script via Context Menu",
            contextMenuGroupId: "navigation",
            contextMenuOrder: 1,
            run: (editor) => {
              toast.success("Running code...");
              console.log("Executed code payload:", editor.getValue());
            },
          },
          {
            id: "delete-file",
            label: "Delete Component",
            contextMenuGroupId: "2_workspace", // Grouped lower down
            run: () => toast.error("File deleted!"),
          },
        ]}
      />
    );
  },
};

export const NoToolbar: Story = {
  name: "6. No Toolbar (Raw Block)",
  args: {
    hideToolbar: true,
    value: INITIAL_CODE,
    height: 300,
    variant: "ghost",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pass `hideToolbar={true}` to hide the toolbar completely, leaving just the raw code block.",
      },
    },
  },
  render: (args) => (
    <Card className="max-w-3xl p-6" shape="minimal">
      <Typography variant="title-medium" className="mb-4">
        Raw Code Block Embed
      </Typography>
      <CodeEditor
        {...args}
        className="rounded-xl border border-outline-variant/30"
      />
    </Card>
  ),
};

export const DisabledContextMenu: Story = {
  name: "7. Disabled Context Menu",
  args: {
    disableContextMenu: true,
    value: "Right-clicking inside this editor will do nothing.",
    height: 150,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pass `disableContextMenu={true}` to completely disable the right-click menu inside the code editor.",
      },
    },
  },
};
