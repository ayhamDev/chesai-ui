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
        "h1",
        "h2",
        "h3",
        "h4",
        "p",
        "blockquote",
        "code",
        "lead",
        "large",
        "small",
        "muted",
      ],
    },
    as: {
      control: "text",
      description:
        'Render the component as a different HTML tag (e.g., "span").',
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
    variant: "p",
    children:
      "This is a default paragraph. The quick brown fox jumps over the lazy dog.",
  },
};

export const Heading1: Story = {
  args: {
    variant: "h1",
    children: "This is an H1 Heading",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="h1">H1: The quick brown fox</Typography>
      <Typography variant="h2">H2: The quick brown fox</Typography>
      <Typography variant="h3">H3: The quick brown fox</Typography>
      <Typography variant="h4">H4: The quick brown fox</Typography>
      <Typography variant="p">
        p: The quick brown fox jumps over the lazy dog. This is a standard
        paragraph used for long-form content.
      </Typography>
      <Typography variant="lead">
        lead: The quick brown fox jumps over the lazy dog. This is a leading
        paragraph that stands out.
      </Typography>
      <Typography variant="large">
        large: The quick brown fox jumps over the lazy dog. For slightly larger,
        emphasized text.
      </Typography>
      <Typography variant="small">
        small: The quick brown fox jumps over the lazy dog. For fine print or
        less important details.
      </Typography>
      <Typography variant="muted">
        muted: The quick brown fox jumps over the lazy dog. For subtle, muted
        text.
      </Typography>
      <Typography variant="blockquote">
        blockquote: "The quick brown fox jumps over the lazy dog."
      </Typography>
      <Typography variant="p">
        Use <code>code</code> variant for inline code like{" "}
        <Typography variant="highlight">npm install your-library</Typography>
      </Typography>
    </div>
  ),
};

export const Polymorphic: Story = {
  args: {
    variant: "h1",
    as: "div", // Render an H1 style but with a <div> tag
    children: "This looks like an H1, but it is a div tag.",
  },
};
