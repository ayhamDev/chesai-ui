import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SelectInput } from "./index";

const meta: Meta<typeof SelectInput> = {
  title: "Components/Select",
  component: SelectInput,
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
    contentPosition: {
      control: "select",
      options: ["item-aligned", "popper"],
      description: "Controls the positioning and animation of the dropdown.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const fruitItems = [
  {
    value: "apple loremfwekfkweiofkjweifjwoeifoifwejfiowejfiowejfowiejfwi",
    label: "Apple loremfwekfkweiofkjweifjwoeifoifwejfiowejfiowejfowiejfwi",
  },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
  { value: "grapes", label: "Grapes" },
  { value: "pineapple", label: "Pineapple", disabled: true },
  { value: "strawberry", label: "Strawberry" },
  { value: "orange", label: "Orange" },
  { value: "mango", label: "Mango" },
  { value: "kiwi", label: "Kiwi" },
  { value: "peach", label: "Peach" },
  { value: "pear", label: "Pear" },
  { value: "watermelon", label: "Watermelon" },
  { value: "cherry", label: "Cherry" },
  { value: "raspberry", label: "Raspberry" },
  { value: "lemon", label: "Lemon" },
];
export const Default: Story = {
  args: {
    variant: "primary",
    shape: "minimal",
    size: "md",
    label: "Favorite Fruit",
    placeholder: "Select a fruit...",
    items: fruitItems,
    contentPosition: "item-aligned", // Default
  },
  render: (args) => {
    const [value, setValue] = useState("");
    return <SelectInput {...args} value={value} onValueChange={setValue} />;
  },
};

export const PopperPosition: Story = {
  name: "Popper Position",
  args: {
    ...Default.args,
    label: "Popper Positioned Select",
    placeholder: "Select a fruit...",
    contentPosition: "popper",
  },
  parameters: {
    docs: {
      description: {
        story:
          "When `contentPosition` is set to `popper`, the content detaches and uses a scale/fade animation, similar to a dropdown menu.",
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState("");
    return <SelectInput {...args} value={value} onValueChange={setValue} />;
  },
};

// ... keep your other stories like AllSizes, AllVariantsAndShapes, and AllStates
export const AllSizes: Story = {
  name: "All Sizes",
  render: () => (
    <div className="flex flex-col gap-6 max-w-sm">
      <SelectInput
        size="sm"
        label="Small"
        placeholder="Select size..."
        items={fruitItems}
      />
      <SelectInput
        size="md"
        label="Medium (Default)"
        placeholder="Select size..."
        items={fruitItems}
      />
      <SelectInput
        size="lg"
        label="Large"
        placeholder="Select size..."
        items={fruitItems}
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
          <SelectInput
            variant="primary"
            shape="full"
            placeholder="Full Shape"
            items={fruitItems}
          />
          <SelectInput
            variant="primary"
            shape="minimal"
            placeholder="Minimal Shape"
            items={fruitItems}
          />
          <SelectInput
            variant="primary"
            shape="sharp"
            placeholder="Sharp Shape"
            items={fruitItems}
          />
        </div>
      </div>
      <div>
        <h3 className="font-bold mb-4">Secondary Variant</h3>
        <div className="flex flex-col gap-4">
          <SelectInput
            variant="secondary"
            shape="full"
            placeholder="Full Shape"
            items={fruitItems}
          />
          <SelectInput
            variant="secondary"
            shape="minimal"
            placeholder="Minimal Shape"
            items={fruitItems}
          />
          <SelectInput
            variant="secondary"
            shape="sharp"
            placeholder="Sharp Shape"
            items={fruitItems}
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
      <div className="flex flex-col gap-4">
        <h3 className="font-bold mb-2">Primary States</h3>
        <SelectInput
          variant="primary"
          label="Default"
          placeholder="Select..."
          items={fruitItems}
        />
        <SelectInput
          variant="primary"
          label="With Value"
          defaultValue="apple"
          items={fruitItems}
        />
        <SelectInput
          variant="primary"
          label="Error State"
          error="Please select a fruit."
          items={fruitItems}
        />
        <SelectInput
          variant="primary"
          label="Disabled"
          placeholder="Cannot select"
          disabled
          items={fruitItems}
        />
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="font-bold mb-2">Secondary States</h3>
        <SelectInput
          variant="secondary"
          label="Default"
          placeholder="Select..."
          items={fruitItems}
        />
        <SelectInput
          variant="secondary"
          label="With Value"
          defaultValue="banana"
          items={fruitItems}
        />
        <SelectInput
          variant="secondary"
          label="Error State"
          error="Please select a fruit."
          items={fruitItems}
        />
        <SelectInput
          variant="secondary"
          label="Disabled"
          placeholder="Cannot select"
          disabled
          items={fruitItems}
        />
      </div>
    </div>
  ),
};
