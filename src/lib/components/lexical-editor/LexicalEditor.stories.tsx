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
          "A deeply integrated rich text editor powered by Meta's Lexical library. Variations match standard layout wrappers (Primary, Secondary, Surface, Ghost) and morph to match all shapes.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "surface", "ghost"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    shadow: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
    readOnly: { control: "boolean" },
    disabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    placeholder: { control: "text" },
    markdown: { control: "text" },
    label: { control: "text" },
    description: { control: "text" },
    errorMessage: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof LexicalEditor>;

export const Default: Story = {
  name: "1. Empty Editor (Interactive)",
  args: {
    label: "Document Content",
    placeholder: "Write something amazing...",
    variant: "primary",
    shape: "minimal",
    shadow: "sm",
    description:
      "Buttons inside the toolbar automatically adapt to the parent shape.",
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
`;

export const VariationsAndStates: Story = {
  name: "2. Shape & Style Variations",
  render: () => {
    const [out, setOut] = useState("");
    return (
      <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
        <LexicalEditor
          label="Primary Variant (Full Shape - Circle Toolbar Buttons)"
          variant="primary"
          shape="full"
          placeholder="Start writing here..."
          description="In Full shape mode, toolbar buttons morph into complete pills/circles."
        />

        <LexicalEditor
          label="Secondary Variant (Sharp Shape)"
          variant="secondary"
          shape="sharp"
          placeholder="Type here..."
          description="In Sharp mode, both outer bounds and internal buttons discard roundness."
        />

        <LexicalEditor
          label="Error / Invalid State (Surface Variant)"
          variant="surface"
          shape="minimal"
          isInvalid={true}
          errorMessage="Content contains restricted words. Please review."
          markdown={SAMPLE_MARKDOWN}
          onChange={setOut}
        />
      </div>
    );
  },
};
