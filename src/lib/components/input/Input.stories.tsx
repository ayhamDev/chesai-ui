import type { Meta, StoryObj } from "@storybook/react";
import { Eye, EyeOff, Mail, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "./index";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
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
    label: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    error: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "primary",
    shape: "minimal",
    label: "Email Address",
    placeholder: "you@example.com",
    startAdornment: <Mail className="h-4 w-4" />,
  },
};

export const AllVariantsAndShapes: Story = {
  name: "All Variants & Shapes",
  render: () => (
    <div className="flex flex-col gap-8 max-w-sm">
      <div>
        <h3 className="font-bold mb-4">Primary Variant</h3>
        <div className="flex flex-col gap-4">
          <Input variant="primary" shape="full" placeholder="Full Shape" />
          <Input
            variant="primary"
            shape="minimal"
            placeholder="Minimal Shape"
          />
          <Input variant="primary" shape="sharp" placeholder="Sharp Shape" />
        </div>
      </div>
      <div>
        <h3 className="font-bold mb-4">Secondary Variant</h3>
        <div className="flex flex-col gap-4">
          <Input variant="secondary" shape="full" placeholder="Full Shape" />
          <Input
            variant="secondary"
            shape="minimal"
            placeholder="Minimal Shape"
          />
          <Input variant="secondary" shape="sharp" placeholder="Sharp Shape" />
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
          <Input
            variant="primary"
            label="Default"
            placeholder="Enter text..."
          />
          <Input
            variant="primary"
            label="With Value"
            defaultValue="Some text"
          />
          <Input
            variant="primary"
            label="Focused"
            placeholder="This input is focused"
            autoFocus
          />
          <Input
            variant="primary"
            label="Error State"
            defaultValue="invalid-email@"
            error="Please enter a valid email address."
          />
          <Input
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
          <Input
            variant="secondary"
            label="Default"
            placeholder="Enter text..."
          />
          <Input
            variant="secondary"
            label="With Value"
            defaultValue="Some text"
          />
          <Input
            variant="secondary"
            label="Focused"
            placeholder="This input is focused"
            autoFocus
          />
          <Input
            variant="secondary"
            label="Error State"
            defaultValue="invalid-email@"
            error="Please enter a valid email address."
          />
          <Input
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

export const WithAdornments: Story = {
  name: "With Adornments",
  render: () => (
    <div className="space-y-4 max-w-sm">
      <Input
        label="Search"
        placeholder="Search for anything..."
        startAdornment={<Search className="h-5 w-5" />}
      />
      <Input
        variant="secondary"
        label="Website"
        startAdornment={<span className="text-gray-400 text-sm">https://</span>}
        endAdornment={<span className="text-gray-400 text-sm">.com</span>}
        defaultValue="chesai"
      />
    </div>
  ),
};
// In Input.stories.tsx

export const NumberInput: Story = {
  name: "Number Input",
  args: {
    label: "Age",
    placeholder: "Enter numbers only",
    type: "number",
  },
  parameters: {
    docs: {
      description: {
        story:
          "When `type='number'`, this input prevents non-numeric characters from being typed or pasted.",
      },
    },
  },
};
export const PasswordInput: Story = {
  name: "Password Input Example",
  render: () => {
    const [isVisible, setIsVisible] = useState(false);
    return (
      <div className="max-w-sm">
        <Input
          label="Password"
          type={isVisible ? "text" : "password"}
          placeholder="Enter your password"
          endAdornment={
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              aria-label={isVisible ? "Hide password" : "Show password"}
              className="p-1 hover:text-gray-600"
            >
              {isVisible ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
        />
      </div>
    );
  },
};
