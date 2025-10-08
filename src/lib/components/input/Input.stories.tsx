import type { Meta, StoryObj } from "@storybook/react";
import { Eye, EyeOff, Mail, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "./index";
import { Card } from "../card";
import { Typography } from "../typography";

const meta: Meta<typeof Input> = {
  title: "Components/Forms & Inputs/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "minimal"],
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
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "primary",
    shape: "minimal",
    size: "md", // Default size
    label: "Email Address",
    placeholder: "you@example.com",
    startAdornment: <Mail className="h-4 w-4" />,
  },
};

export const CompositionWithMinimal: Story = {
  name: "Composition with Minimal Variant",
  render: () => (
    <div className="flex flex-col gap-8 max-w-sm">
      <Typography variant="h4">Custom Search Bar</Typography>
      <Card variant="secondary" shape="full" padding="none">
        <Input
          variant="minimal"
          size="md"
          placeholder="Search..."
          startAdornment={<Search className="h-5 w-5 ml-4" />}
          wrapperClassName="h-12"
        />
      </Card>
      <Typography variant="h4">Error State</Typography>
      <Card variant="primary" shape="minimal" padding="sm" isSelected>
        <Input
          variant="minimal"
          size="md"
          placeholder="Search..."
          startAdornment={<Search className="h-5 w-5 mr-2" />}
          error="Search term is required."
          wrapperClassName="h-12"
        />
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The `minimal` variant is completely unstyled, making it perfect for composing custom input components. Here, it's placed inside a `Card` to create a search bar. The card provides the background and border, while the input only provides the text functionality.",
      },
    },
  },
};

export const AllSizes: Story = {
  name: "All Sizes",
  render: () => (
    <div className="flex flex-col gap-6 max-w-sm">
      <Input
        size="sm"
        label="Small"
        placeholder="Small input (sm)"
        startAdornment={<Search className="h-4 w-4" />}
      />
      <Input
        size="md"
        label="Medium (Default)"
        placeholder="Medium input (md)"
        startAdornment={<Search className="h-5 w-5" />}
      />
      <Input
        size="lg"
        label="Large"
        placeholder="Large input (lg)"
        startAdornment={<Search className="h-6 w-6" />}
      />
    </div>
  ),
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
      <div>
        <h3 className="font-bold mb-4">Minimal Variant (Standalone)</h3>
        <div className="flex flex-col gap-4 p-4 bg-graphite-secondary rounded-lg">
          <Input variant="minimal" placeholder="No background or border" />
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
