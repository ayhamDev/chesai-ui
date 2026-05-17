// src/lib/components/lexical-editor/LexicalEditor.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { LexicalEditor } from "./index";
import { Card } from "../card";
import { Typography } from "../typography";

const meta: Meta<typeof LexicalEditor> = {
  title: "Components/Forms & Inputs/LexicalEditor",
  component: LexicalEditor,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A deeply integrated rich text editor powered by Meta's Lexical library. It maps perfectly to MD3 components and standard tailwind classes, supporting seamless Markdown parsing and output.",
      },
    },
  },
  argTypes: {
    readOnly: { control: "boolean" },
    placeholder: { control: "text" },
    markdown: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof LexicalEditor>;

export const Default: Story = {
  name: "1. Empty Editor",
  args: {
    placeholder: "Write something amazing...",
  },
  render: (args) => (
    <div className="w-full max-w-4xl mx-auto">
      <LexicalEditor {...args} />
    </div>
  ),
};

const SAMPLE_MARKDOWN = `# Welcome to Lexical!

This is a **Rich Text Editor** powered by Lexical, styled natively with your design system. 

It handles everything you need out-of-the-box:
* Seamless Markdown shortcuts. (Try typing \`#\` or \`*\`!)
* Deep integration with the \`Toolbar\` component.
* Emits pure markdown string on change.

> "A design system without a rich text editor is like a car without a steering wheel." 
> — Developer Proverb

You can even add code blocks:
\`\`\`javascript
function greet(name) {
   console.log("Hello, " + name);
}
\`\`\`
`;

export const WithMarkdown: Story = {
  name: "2. Markdown Powered",
  parameters: {
    docs: {
      description: {
        story:
          "Pass `markdown` to the editor to pre-populate it, and tap into `onChange` to seamlessly output parsed markdown continuously.",
      },
    },
  },
  render: function Render(args) {
    const [output, setOutput] = useState("");

    return (
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
        <LexicalEditor
          {...args}
          markdown={SAMPLE_MARKDOWN}
          onChange={setOutput}
        />
        <Card variant="secondary" className="p-4 overflow-x-auto min-h-32">
          <Typography variant="label-large" className="opacity-50 mb-2">
            Live Output (Markdown)
          </Typography>
          <pre className="text-xs font-mono">{output}</pre>
        </Card>
      </div>
    );
  },
};

export const ReadOnly: Story = {
  name: "3. Read Only View",
  args: {
    markdown:
      "## Read Only Notice\n\nThis content is strictly for **viewing**.",
    readOnly: true,
  },
  render: (args) => (
    <div className="w-full max-w-3xl mx-auto">
      <LexicalEditor {...args} />
    </div>
  ),
};
