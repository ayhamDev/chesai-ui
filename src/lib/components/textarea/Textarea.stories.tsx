import type { Meta, StoryObj } from "@storybook/react";
import { TextArea } from "./index";

const meta: Meta<typeof TextArea> = {
  title: "Components/Forms & Inputs/TextArea",
  component: TextArea,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    label: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    error: { control: "text" },
    rows: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "primary",
    shape: "minimal",
    size: "md",
    label: "Your Message",
    placeholder: "Enter your comments here...",
    rows: 4,
  },
};

export const AllSizes: Story = {
  name: "All Sizes",
  render: () => (
    <div className="flex flex-col gap-6 max-w-sm">
      <TextArea
        size="sm"
        label="Small"
        placeholder="Small textarea (sm)"
        rows={3}
      />
      <TextArea
        size="md"
        label="Medium (Default)"
        placeholder="Medium textarea (md)"
        rows={3}
      />
      <TextArea
        size="lg"
        label="Large"
        placeholder="Large textarea (lg)"
        rows={3}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "The `size` prop controls the vertical padding and font size.",
      },
    },
  },
};

export const AllVariantsAndShapes: Story = {
  name: "All Variants & Shapes",
  render: () => (
    <div className="flex flex-col gap-8 max-w-sm">
      <div>
        <h3 className="font-bold mb-4">Primary Variant</h3>
        <div className="flex flex-col gap-4">
          <TextArea
            variant="primary"
            shape="full"
            placeholder="Full Shape"
            rows={2}
          />
          <TextArea
            variant="primary"
            shape="minimal"
            placeholder="Minimal Shape"
            rows={2}
          />
          <TextArea
            variant="primary"
            shape="sharp"
            placeholder="Sharp Shape"
            rows={2}
          />
        </div>
      </div>
      <div>
        <h3 className="font-bold mb-4">Secondary Variant</h3>
        <div className="flex flex-col gap-4">
          <TextArea
            variant="secondary"
            shape="full"
            placeholder="Full Shape"
            rows={2}
          />
          <TextArea
            variant="secondary"
            shape="minimal"
            placeholder="Minimal Shape"
            rows={2}
          />
          <TextArea
            variant="secondary"
            shape="sharp"
            placeholder="Sharp Shape"
            rows={2}
          />
        </div>
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  name: "All States",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
      <div>
        <h3 className="font-bold mb-4">Primary States</h3>
        <div className="flex flex-col gap-4">
          <TextArea
            variant="primary"
            label="Default"
            placeholder="Enter a description..."
          />
          <TextArea
            variant="primary"
            label="With Value"
            defaultValue="This is some pre-filled text in the textarea."
          />
          <TextArea
            variant="primary"
            label="Error State"
            defaultValue="This message is too short."
            error="Message must be at least 50 characters."
          />
          <TextArea
            variant="primary"
            label="Disabled"
            placeholder="Cannot edit"
            disabled
          />
        </div>
      </div>
      <div>
        <h3 className="font-bold mb-4">Secondary States</h3>
        <div className="flex flex-col gap-4">
          <TextArea
            variant="secondary"
            label="Default"
            placeholder="Enter a description..."
          />
          <TextArea
            variant="secondary"
            label="With Value"
            defaultValue="This is some pre-filled text in the textarea."
          />
          <TextArea
            variant="secondary"
            label="Error State"
            defaultValue="This message is too short."
            error="Message must be at least 50 characters."
          />
          <TextArea
            variant="secondary"
            label="Disabled"
            placeholder="Cannot edit"
            disabled
          />
        </div>
      </div>
    </div>
  ),
};

export const WithCustomRows: Story = {
  name: "With Custom Rows",
  args: {
    label: "A Tall Text Area",
    placeholder: "This area starts with 8 rows",
    rows: 8,
  },
};
