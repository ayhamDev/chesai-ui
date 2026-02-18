import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Switch } from "./index";
import { Card } from "../card";
import { Typography } from "../typography";

const meta: Meta<typeof Switch> = {
  title: "Components/Forms & Inputs/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    label: { control: "text" },
    description: { control: "text" },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    withIcons: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const MaterialSpecs: Story = {
  args: {
    size: "md"
  },

  name: "Material You Spec Sheet",

  render: () => {
    // We recreate the visual spec sheet from the user request
    return (
      <div className="flex flex-col gap-8 p-8 bg-surface-container-low rounded-3xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant pb-4">
          <Typography variant="title-small">Switch Variations</Typography>
        </div>

        <div className="grid grid-cols-2 gap-12 items-start">
          {/* Column 1: States */}
          <div className="flex flex-col gap-6">
            <Typography variant="label-large" className="opacity-50">
              States
            </Typography>

            <div className="flex items-center justify-between gap-4">
              <Typography variant="body-medium">Unselected</Typography>
              <Switch defaultChecked={false} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Typography variant="body-medium">Selected</Typography>
              <Switch defaultChecked={true} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Typography variant="body-medium">
                Unselected (Disabled)
              </Typography>
              <Switch defaultChecked={false} disabled />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Typography variant="body-medium">Selected (Disabled)</Typography>
              <Switch defaultChecked={true} disabled />
            </div>
          </div>

          {/* Column 2: Icons & Sizes */}
          <div className="flex flex-col gap-6">
            <Typography variant="label-large" className="opacity-50">
              Configuration
            </Typography>

            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <Typography variant="body-medium">With Icons</Typography>
                <Typography
                  variant="body-small"
                  className="text-muted-foreground"
                >
                  Default MD3 behavior
                </Typography>
              </div>
              <Switch defaultChecked={true} withIcons={true} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <Typography variant="body-medium">No Icons</Typography>
                <Typography
                  variant="body-small"
                  className="text-muted-foreground"
                >
                  Clean look
                </Typography>
              </div>
              <Switch defaultChecked={true} withIcons={false} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <Typography variant="body-medium">With 'X' Icon</Typography>
                <Typography
                  variant="body-small"
                  className="text-muted-foreground"
                >
                  Explicit off state
                </Typography>
              </div>
              <Switch
                defaultChecked={false}
                withIcons={true}
                showUncheckedIcon={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export const Interactive: Story = {
  name: "Interactive Demo",
  render: () => {
    const [wifi, setWifi] = useState(true);
    const [bluetooth, setBluetooth] = useState(false);
    const [airplane, setAirplane] = useState(false);

    return (
      <Card className="w-80 p-0 overflow-hidden">
        <div className="p-4 bg-surface-container-highest/30 border-b border-outline-variant">
          <Typography variant="title-small">Connectivity</Typography>
        </div>
        <div className="p-4 flex flex-col gap-6">
          <Switch
            label="Wi-Fi"
            description={wifi ? "Connected to Home_5G" : "Networks available"}
            checked={wifi}
            onCheckedChange={setWifi}
          />
          <Switch
            label="Bluetooth"
            checked={bluetooth}
            onCheckedChange={setBluetooth}
          />
          <div className="h-px w-full bg-outline-variant/50" />
          <Switch
            label="Airplane Mode"
            description="Disable all wireless connections"
            checked={airplane}
            onCheckedChange={setAirplane}
            withIcons={true}
            showUncheckedIcon={true}
          />
        </div>
      </Card>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Switch size="sm" defaultChecked />
        <Typography variant="body-small">Small</Typography>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Switch size="md" defaultChecked />
        <Typography variant="body-small">Medium (Default)</Typography>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Switch size="lg" defaultChecked />
        <Typography variant="body-small">Large</Typography>
      </div>
    </div>
  ),
};
