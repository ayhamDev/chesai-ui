import type { Meta, StoryObj } from "@storybook/react";
import { MediumTextEditor } from "./index";
import { Card } from "../card";
import { Button } from "../button";
import { useState } from "react";
import { OutputData } from "@editorjs/editorjs";

const meta: Meta<typeof MediumTextEditor> = {
  title: "Components/Forms & Inputs/MediumTextEditor",
  component: MediumTextEditor,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A block-style rich text editor powered by Editor.js, styled to match the Chesai UI design system (MD3).",
      },
    },
  },
  argTypes: {
    readOnly: { control: "boolean" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof MediumTextEditor>;

const INITIAL_DATA: OutputData = {
  time: 1635603431943,
  blocks: [
    {
      id: "sheNwCUP5A",
      type: "header",
      data: {
        text: "Editor.js",
        level: 2,
      },
    },
    {
      id: "12iM3lqzcm",
      type: "paragraph",
      data: {
        text: "Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.",
      },
    },
    {
      id: "fvZGuFXHmK",
      type: "header",
      data: {
        text: "Key features",
        level: 3,
      },
    },
    {
      id: "x7o28_g3b8",
      type: "list",
      data: {
        style: "unordered",
        items: [
          "It is a block-styled editor",
          "It returns clean data output in JSON",
          "Designed to be extendable and pluggable with a simple API",
        ],
      },
    },
  ],
};

export const Default: Story = {
  args: {
    placeholder: "Type your story...",
    minHeight: 300,
  },
  render: (args) => (
    <Card className="max-w-4xl mx-auto p-8 bg-surface border-outline-variant">
      <MediumTextEditor {...args} />
    </Card>
  ),
};

export const WithInitialData: Story = {
  args: {
    data: INITIAL_DATA,
    minHeight: 400,
  },
  render: (args) => (
    <Card className="max-w-4xl mx-auto p-8 bg-surface border-outline-variant">
      <MediumTextEditor {...args} />
    </Card>
  ),
};

export const ReadOnly: Story = {
  name: "Read Only",
  args: {
    data: INITIAL_DATA,
    readOnly: true,
  },
  render: (args) => (
    <Card className="max-w-4xl mx-auto p-8 bg-surface-container-low border-transparent">
      <MediumTextEditor {...args} />
    </Card>
  ),
};

export const Interactive: Story = {
  name: "Interactive Demo",
  render: function Render() {
    const [data, setData] = useState<OutputData | undefined>(INITIAL_DATA);

    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => console.log("Current Data:", data)}
          >
            Log Data to Console
          </Button>
          <Button onClick={() => alert("Saved!")}>Save</Button>
        </div>

        <Card className="p-8 bg-surface border-outline-variant min-h-[400px]">
          <MediumTextEditor
            data={data}
            onChange={setData}
            placeholder="Start typing ..."
          />
        </Card>

        <div className="p-4 bg-surface-container-high rounded-xl overflow-auto max-h-64 border border-outline-variant">
          <pre className="text-xs font-mono text-on-surface">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
};
