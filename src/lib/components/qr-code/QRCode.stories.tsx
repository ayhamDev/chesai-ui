import type { Meta, StoryObj } from "@storybook/react";
import { QRCode } from "./index";

const meta: Meta<typeof QRCode> = {
  title: "Components/Data/QRCode",
  component: QRCode,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    value: { control: "text" },
    size: { control: { type: "range", min: 100, max: 500, step: 10 } },
    dotShape: {
      control: "select",
      options: ["square", "circle", "rounded", "diamond"],
    },
    cornerShape: {
      control: "select",
      options: ["square", "rounded", "extra-rounded", "circle"],
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
    dotShape: "rounded",
    cornerShape: "extra-rounded",
    variant: "primary",
  },
};

export const MaterialYouStyle: Story = {
  name: "Material You Style",
  args: {
    value: "https://material.io",
    size: 280,
    dotShape: "circle",
    cornerShape: "extra-rounded",
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
    cornerShape: "square",
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
        cornerShape="rounded"
      />
    </div>
  ),
  args: {
    size: 250,
  },
};

export const WithToolbar: Story = {
  name: "With Action Toolbar",
  args: {
    value: "https://github.com/ayhamdev",
    size: 250,
    dotShape: "circle",
    cornerShape: "circle",
    variant: "secondary",
    showToolbar: true,
    shadow: "md",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Enable the `showToolbar` prop to display Copy, Download, and Share buttons. The QR code creates a high-resolution PNG on the fly for these actions.",
      },
    },
  },
};
export const WithToolbarAndData: Story = {
  name: "With Toolbar & Data Display",
  args: {
    value: "https://github.com/ayhamdev",
    size: 250,
    dotShape: "rounded",
    cornerShape: "rounded",
    variant: "secondary",
    showToolbar: true,
    showData: true,
    shadow: "md",
    cornerColor: "var(--md-sys-color-primary)",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Enable `showToolbar` to display actions and `showData` to display the QR content in a styled pill.",
      },
    },
  },
};
