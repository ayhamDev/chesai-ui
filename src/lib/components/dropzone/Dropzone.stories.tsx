import type { Meta, StoryObj } from "@storybook/react";
import { Dropzone } from "./index";

const meta: Meta<typeof Dropzone> = {
  title: "Components/Forms & Inputs/Dropzone",
  component: Dropzone,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof Dropzone>;

export const Default: Story = {
  args: {
    label: "Upload Document",
    description: "Drag and drop your PDF here, or click to browse.",
    accept: ".pdf",
    onDrop: (files) => console.log(files),
  },
  render: (args) => (
    <div className="w-[500px]">
      <Dropzone {...args} />
    </div>
  ),
};

export const SingleFileLimit: Story = {
  args: {
    label: "Profile Picture",
    description: "JPEG or PNG under 2MB. Single file only.",
    multiple: false,
    maxSize: 2 * 1024 * 1024, // 2MB
    onDrop: (files) => console.log(files),
  },
  render: (args) => (
    <div className="w-[400px]">
      <Dropzone {...args} />
    </div>
  ),
};
