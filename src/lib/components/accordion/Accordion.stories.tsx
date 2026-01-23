import type { Meta, StoryObj } from "@storybook/react";
import { Typography } from "../typography";
import { Accordion } from "./index";

const meta: Meta<typeof Accordion> = {
  title: "Components/Data/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A vertically stacked set of interactive headings that each reveal a section of content. Built on Radix UI for accessibility and styled for chesai-ui.",
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["single", "multiple"],
      description: "Determines if one or multiple items can be open at once.",
    },
    layout: {
      control: "select",
      options: ["integrated", "separated"],
      description: "The structural layout of the items.",
    },
    variant: {
      control: "select",
      options: ["primary", "secondary"],
      description: "The visual style of the accordion items.",
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "The border-radius of the accordion items.",
    },
    collapsible: {
      control: "boolean",
      description: "When type is 'single', allows closing all items.",
    },
    defaultValue: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const AccordionItems = () => (
  <>
    <Accordion.Item value="item-1">
      <Accordion.Trigger>What is chesai-ui?</Accordion.Trigger>
      <Accordion.Content>
        <Typography variant="p">
          chesai-ui is a React component library designed for building modern,
          accessible, and beautiful user interfaces with ease.
        </Typography>
      </Accordion.Content>
    </Accordion.Item>
    <Accordion.Item value="item-2">
      <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
      <Accordion.Content>
        <Typography variant="p">
          Yes. It is built on top of Radix UI primitives, which are fully
          accessible and follow WAI-ARIA design patterns.
        </Typography>
      </Accordion.Content>
    </Accordion.Item>
    <Accordion.Item value="item-3">
      <Accordion.Trigger>Can I customize the styling?</Accordion.Trigger>
      <Accordion.Content>
        <Typography variant="p">
          Absolutely. The library is built with Tailwind CSS and CSS variables,
          making it highly customizable to fit your brand's design system.
        </Typography>
      </Accordion.Content>
    </Accordion.Item>
  </>
);

export const IntegratedLayout: Story = {
  name: "1. Integrated Layout (Default)",
  args: {
    type: "single",
    collapsible: true,
    defaultValue: "item-1",
    layout: "integrated",
    variant: "primary",
  },
  render: (args) => (
    <div className="w-96">
      <Accordion {...args}>
        <AccordionItems />
      </Accordion>
    </div>
  ),
};

export const SeparatedLayout: Story = {
  name: "2. Separated Layout",
  args: {
    type: "single",
    collapsible: true,
    layout: "separated",
    variant: "secondary",
    shape: "minimal",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `separated` layout renders each item as a distinct, card-like element, separated by a gap.",
      },
    },
  },
  render: (args) => (
    <div className="w-96">
      <Accordion {...args}>
        <AccordionItems />
      </Accordion>
    </div>
  ),
};

export const VariantCombinations: Story = {
  name: "3. Variant Combinations",
  args: {
    type: "single",
    collapsible: true,
    layout: "separated",
    shape: "minimal",
  },
  render: (args) => (
    <div className="flex items-start gap-8">
      <div className="w-80">
        <Typography variant="h4" className="mb-4 text-center">
          Layout: Separated
          <br />
          Variant: Primary
        </Typography>
        <Accordion {...args} variant="primary">
          <AccordionItems />
        </Accordion>
      </div>
      <div className="w-80">
        <Typography variant="h4" className="mb-4 text-center">
          Layout: Separated
          <br />
          Variant: Secondary
        </Typography>
        <Accordion {...args} variant="secondary">
          <AccordionItems />
        </Accordion>
      </div>
    </div>
  ),
};

export const MultipleOpen: Story = {
  name: "4. Allow Multiple Open",
  args: {
    type: "multiple",
    layout: "integrated",
    defaultValue: ["item-1", "item-3"],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Set `type='multiple'` to allow users to open more than one item at a time.",
      },
    },
  },
  render: (args) => (
    <div className="w-96">
      <Accordion {...args}>
        <AccordionItems />
      </Accordion>
    </div>
  ),
};

export const RippleControl: Story = {
  name: "5. Ripple Control",
  args: {
    type: "single",
    collapsible: true,
    layout: "integrated",
  },
  parameters: {
    docs: {
      description: {
        story:
          "You can explicitly disable the ripple effect on a trigger by setting `disableRipple={true}` on the `<Accordion.Trigger>` component.",
      },
    },
  },
  render: (args) => (
    <div className="w-96">
      <Accordion {...args}>
        <Accordion.Item value="item-1">
          <Accordion.Trigger>Ripple Enabled (Default)</Accordion.Trigger>
          <Accordion.Content>
            <Typography variant="p">
              Click the trigger to see the ripple effect.
            </Typography>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Trigger disableRipple={true}>
            Ripple Disabled
          </Accordion.Trigger>
          <Accordion.Content>
            <Typography variant="p">
              This trigger will not have a ripple effect.
            </Typography>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  ),
};
