import type { Meta, StoryObj } from "@storybook/react";
import { Dropzone, VirtualDropzone } from "./index";
import { Typography } from "../typography";
import { Button } from "../button";
import { useState } from "react";

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

// --- VIRTUAL DROPZONE STORY ---

export const VirtualWrapper: StoryObj<typeof VirtualDropzone> = {
  name: "Virtual Dropzone (Wrapper)",
  parameters: {
    docs: {
      description: {
        story:
          "The `VirtualDropzone` wraps around any UI layout (like a chat window or data table). It remains invisible until the user drags a file over the browser window, showing a beautiful overlay.",
      },
    },
  },
  render: () => {
    const [droppedFiles, setDroppedFiles] = useState<string[]>([]);

    return (
      <div className="w-[600px] h-[400px] border border-outline-variant rounded-3xl overflow-hidden shadow-sm bg-background">
        <VirtualDropzone
          onDropFiles={(files) =>
            setDroppedFiles((prev) => [...prev, ...files.map((f) => f.name)])
          }
        >
          {/* Simulated App Content */}
          <div className="h-full w-full flex flex-col">
            <div className="p-4 bg-surface-container border-b border-outline-variant flex items-center justify-between">
              <Typography variant="title-medium" className="font-bold">
                Project Dashboard
              </Typography>
              <Button size="sm" variant="secondary">
                Settings
              </Button>
            </div>

            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              {droppedFiles.length === 0 ? (
                <>
                  <Typography variant="title-large" className="mb-2">
                    No files uploaded yet
                  </Typography>
                  <Typography
                    variant="body-medium"
                    className="text-on-surface-variant max-w-sm"
                  >
                    Try dragging a file from your computer directly over this
                    entire window to see the virtual dropzone in action.
                  </Typography>
                </>
              ) : (
                <div className="w-full text-left bg-surface-container-low p-4 rounded-xl">
                  <Typography
                    variant="label-large"
                    className="font-bold mb-2 block"
                  >
                    Recently Dropped Files:
                  </Typography>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-on-surface-variant">
                    {droppedFiles.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </VirtualDropzone>
      </div>
    );
  },
};
