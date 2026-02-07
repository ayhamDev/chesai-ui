import type { Meta, StoryObj } from "@storybook/react";
import { Typography } from "./index";

const meta: Meta<typeof Typography> = {
  title: "Components/Typography",
  component: Typography,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "display-large",
        "display-medium",
        "display-small",
        "headline-large",
        "headline-medium",
        "headline-small",
        "title-large",
        "title-medium",
        "title-small",
        "body-large",
        "body-medium",
        "body-small",
        "label-large",
        "label-medium",
        "label-small",
        "blockquote",
      ],
      description: "The visual style of the text.",
    },
    highlighted: {
      control: "boolean",
      description: "Applies code-like highlighting to the text.",
    },
    highlightedVariant: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "error"],
      if: { arg: "highlighted" },
    },
    highlightedShape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      if: { arg: "highlighted" },
    },
    as: {
      control: "text",
      description:
        'Render the component as a different HTML tag (e.g., "span", "h1").',
    },
    children: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "display-medium",
    children: "Material Design 3 Typography.",
  },
};

export const MaterialScale: Story = {
  name: "MD3 Type Scale",
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Typography variant="label-large" className="text-primary">
          Display
        </Typography>
        <div className="space-y-1">
          <Typography variant="display-large">Display Large</Typography>
          <Typography variant="display-medium">Display Medium</Typography>
          <Typography variant="display-small">Display Small</Typography>
        </div>
      </div>

      <div className="space-y-2">
        <Typography variant="label-large" className="text-primary">
          Headline
        </Typography>
        <div className="space-y-1">
          <Typography variant="headline-large">Headline Large</Typography>
          <Typography variant="headline-medium">Headline Medium</Typography>
          <Typography variant="headline-small">Headline Small</Typography>
        </div>
      </div>

      <div className="space-y-2">
        <Typography variant="label-large" className="text-primary">
          Title
        </Typography>
        <div className="space-y-1">
          <Typography variant="title-large">Title Large</Typography>
          <Typography variant="title-medium">Title Medium</Typography>
          <Typography variant="title-small">Title Small</Typography>
        </div>
      </div>

      <div className="space-y-2">
        <Typography variant="label-large" className="text-primary">
          Body
        </Typography>
        <div className="space-y-1">
          <Typography variant="body-large">
            Body Large - Lorem ipsum dolor sit amet.
          </Typography>
          <Typography variant="body-medium">
            Body Medium - Lorem ipsum dolor sit amet.
          </Typography>
          <Typography variant="body-small">
            Body Small - Lorem ipsum dolor sit amet.
          </Typography>
        </div>
      </div>

      <div className="space-y-2">
        <Typography variant="label-large" className="text-primary">
          Label
        </Typography>
        <div className="space-y-1">
          <Typography variant="label-large">Label Large</Typography>
          <Typography variant="label-medium">Label Medium</Typography>
          <Typography variant="label-small">Label Small</Typography>
        </div>
      </div>
    </div>
  ),
};

export const Blockquote: Story = {
  name: "Quote Style",
  args: {
    variant: "blockquote",
    children:
      "Design is not just what it looks like and feels like. Design is how it works.",
  },
};

export const Highlighted: Story = {
  name: "Highlighted (Code)",
  render: () => (
    <div className="space-y-4">
      <Typography variant="body-large">
        Run
        <Typography
          as="span"
          highlighted
          highlightedVariant="secondary"
          highlightedShape="minimal"
        >
          npm install chesai-ui
        </Typography>
        to get started.
      </Typography>

      <Typography variant="body-large">
        Error:
        <Typography
          as="span"
          highlighted
          highlightedVariant="error"
          highlightedShape="full"
        >
          Connection Timeout
        </Typography>
      </Typography>

      <Typography variant="body-large">
        Primary Tag:
        <Typography
          as="span"
          highlighted
          highlightedVariant="primary"
          highlightedShape="sharp"
        >
          v2.0.1
        </Typography>
      </Typography>
    </div>
  ),
};
