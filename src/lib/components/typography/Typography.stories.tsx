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
        // MD3 Variants
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
        // Legacy Variants
        "h1",
        "h2",
        "h3",
        "h4",
        "p",
        "lead",
        "large",
        "small",
        "muted",
        "blockquote",
        "code",
      ],
      description: "The visual style of the text.",
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
    children: "Material Design 3 Typography. This is body-medium text.",
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

export const LegacyMapping: Story = {
  name: "Legacy Aliases",
  render: () => (
    <div className="space-y-4">
      <Typography variant="h1">H1 (Mapped to Headline Large)</Typography>
      <Typography variant="h2">H2 (Mapped to Headline Medium)</Typography>
      <Typography variant="h3">H3 (Mapped to Headline Small)</Typography>
      <Typography variant="h4">H4 (Mapped to Title Large)</Typography>
      <Typography variant="p">
        Paragraph (Mapped to Body Large). The quick brown fox jumps over the
        lazy dog.
      </Typography>
      <Typography variant="lead">
        Lead (Mapped to Body Large + Muted color).
      </Typography>
      <Typography variant="muted">
        Muted (Mapped to Body Medium + Muted color).
      </Typography>
      <Typography variant="blockquote">
        Blockquote: "Design is not just what it looks like and feels like.
        Design is how it works."
      </Typography>
      <Typography variant="body-medium">
        Use{" "}
        <Typography variant="code" as="span">
          npm install
        </Typography>{" "}
        to get started.
      </Typography>
    </div>
  ),
};

export const Polymorphic: Story = {
  args: {
    variant: "headline-large",
    as: "h1",
    children: "This looks like a Headline Large, but renders as an H1 tag.",
  },
};
