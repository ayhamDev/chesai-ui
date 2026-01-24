import type { Meta, StoryObj } from "@storybook/react";
import { QRCode } from "./index";

const meta: Meta<typeof QRCode> = {
  title: "Components/Data/QRCode",
  component: QRCode,
  subcomponents: {
    "QRCode.Canvas": QRCode.Canvas,
    "QRCode.Toolbar": QRCode.Toolbar,
    "QRCode.Content": QRCode.Content,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    value: { control: "text" },
    size: { control: { type: "range", min: 100, max: 500, step: 10 } },
    dotShape: {
      control: "select",
      options: ["square", "circle", "rounded", "diamond", "classy"],
      description: "Shape of the data modules",
    },
    cornerFrameShape: {
      control: "select",
      options: ["square", "rounded", "extra-rounded", "circle", "leaf"],
      description: "Shape of the outer finder patterns (Eyes)",
    },
    cornerDotShape: {
      control: "select",
      options: ["square", "circle", "rounded", "diamond"],
      description: "Shape of the inner finder patterns (Eyeballs)",
    },
    color: { control: "color" },
    cornerColor: { control: "color" },
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "white"],
    },
    shadow: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
    logo: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof QRCode>;

export const Default: Story = {
  args: {
    value: "https://chesai-ui.com",
    size: 250,
    dotShape: "circle",
    cornerFrameShape: "rounded",
    cornerDotShape: "rounded",
    variant: "ghost",
    ecLevel: "M",
    shadow: "none",
    showToolbar: true,
  },
};

export const CustomShapes: Story = {
  name: "Custom Shapes Configuration",
  args: {
    value: "https://example.com/custom-shapes",
    size: 280,
    variant: "secondary",
    dotShape: "classy",
    cornerFrameShape: "rounded",
    cornerDotShape: "diamond",
    color: "var(--md-sys-color-primary)",
    cornerColor: "var(--md-sys-color-tertiary)",
    shadow: "sm",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Mix and match `dotShape`, `cornerFrameShape`, and `cornerDotShape` to create unique QR styles.",
      },
    },
  },
};

export const MaterialYouStyle: Story = {
  name: "Material You Style",
  args: {
    value: "https://material.io",
    size: 280,
    dotShape: "circle",
    cornerFrameShape: "extra-rounded",
    cornerDotShape: "circle",
    variant: "secondary",
    shadow: "sm",
    // Use CSS vars for theme consistency
    color: "var(--md-sys-color-on-secondary-container)",
    cornerColor: "var(--md-sys-color-primary)",
  },
};

export const WithLogo: Story = {
  name: "With Brand Logo",
  args: {
    value: "https://github.com",
    size: 300,
    dotShape: "square",
    cornerFrameShape: "square",
    cornerDotShape: "square",
    variant: "white",
    shadow: "md",
    color: "#000000",
    logo: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    logoBackgroundColor: "#ffffff",
  },
};

export const CustomColors: Story = {
  name: "Custom Gradients & Colors",
  render: (args) => (
    <div className="p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl">
      <QRCode
        {...args}
        value="https://openai.com"
        variant="ghost"
        color="white"
        cornerColor="white"
        className="bg-white/10 backdrop-blur-md"
        dotShape="diamond"
        cornerFrameShape="rounded"
        cornerDotShape="diamond"
      />
    </div>
  ),
  args: {
    size: 250,
  },
};

export const ComposableStructure: Story = {
  name: "Composable Structure",
  parameters: {
    docs: {
      description: {
        story:
          "You can use the `QRCode` component as a wrapper and compose `QRCode.Canvas`, `QRCode.Content`, and `QRCode.Toolbar` as direct children.",
      },
    },
  },
  render: (args) => (
    <QRCode {...args} showToolbar={false} showData={false}>
      <div className="mb-4 text-center font-bold text-lg opacity-70">
        Scan Me
      </div>
      <QRCode.Canvas />
      <div className="my-4">
        <QRCode.Toolbar />
      </div>
      <QRCode.Content />
    </QRCode>
  ),
  args: {
    value: "https://example.com/composable",
    size: 220,
    variant: "secondary",
    dotShape: "rounded",
    cornerFrameShape: "circle",
    cornerDotShape: "circle",
  },
};
