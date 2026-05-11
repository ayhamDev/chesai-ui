import type { Meta, StoryObj } from "@storybook/react";
import { Laptop, Monitor, Smartphone, Tv } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../button";
import { ButtonGroup } from "../button-group";
import { Card } from "../card";
import { Input } from "../input";
import { Typography } from "../typography";
import { AdaptiveActivity, type EnvState } from "./index";

const meta: Meta<typeof AdaptiveActivity> = {
  title: "Components/Layout/AdaptiveActivity",
  component: AdaptiveActivity,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A powerful layout component utilizing the new React 19 `<Activity>` API. It switches UI layouts based on OS, Device Type, and Screen size.\n\n**State Preservation:** Hidden views maintain their internal React state (like input text) and scroll position because they are strictly paused instead of being unmounted.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AdaptiveActivity>;

// Reusable dummy form to prove state preservation
const DummyForm = ({ title, icon: Icon }: any) => {
  const [val, setVal] = useState("");
  return (
    <Card className="w-[350px] p-6 shadow-xl" variant="surface-container">
      <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
        <div className="p-3 bg-primary text-on-primary rounded-full">
          <Icon size={24} />
        </div>
        <div>
          <Typography variant="title-medium">{title}</Typography>
          <Typography variant="body-small" muted>
            State is retained!
          </Typography>
        </div>
      </div>
      <Input
        label="Type something..."
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Type here..."
      />
    </Card>
  );
};

export const StatePreservationDemo: Story = {
  name: "State Preservation (Simulated)",
  render: () => {
    // We mock the environment here so you can test it directly in storybook without
    // actually grabbing your TV remote.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [mockEnv, setMockEnv] = useState<Partial<EnvState>>({
      device: "desktop",
      os: "mac",
      fofo: "baba",
    });

    return (
      <div className="flex flex-col items-center gap-8">
        <Typography variant="body-medium" className="text-center max-w-lg">
          Try typing some text in the input below, then click a different device
          button to switch layouts. Notice how the state in the other views is
          perfectly preserved when you switch back!
        </Typography>

        <ButtonGroup shape="minimal">
          <Button
            variant={mockEnv.os === "mac" ? "primary" : "secondary"}
            onClick={() => setMockEnv({ os: "mac", device: "desktop" })}
          >
            <Monitor className="w-4 h-4 mr-2" /> Mac Desktop
          </Button>
          <Button
            variant={mockEnv.os === "windows" ? "primary" : "secondary"}
            onClick={() => setMockEnv({ os: "windows", device: "desktop" })}
          >
            <Laptop className="w-4 h-4 mr-2" /> Windows App
          </Button>
          <Button
            variant={mockEnv.device === "mobile" ? "primary" : "secondary"}
            onClick={() => setMockEnv({ os: "ios", device: "mobile" })}
          >
            <Smartphone className="w-4 h-4 mr-2" /> iOS Mobile
          </Button>
          <Button
            variant={mockEnv.device === "tv" ? "primary" : "secondary"}
            onClick={() => setMockEnv({ os: "android", device: "tv" })}
          >
            <Tv className="w-4 h-4 mr-2" /> Google TV
          </Button>
        </ButtonGroup>

        {/* The Component in action */}
        <AdaptiveActivity envOverride={mockEnv}>
          <AdaptiveActivity.Match os="mac" device="desktop">
            <DummyForm title="Mac Desktop View" icon={Monitor} />
          </AdaptiveActivity.Match>

          <AdaptiveActivity.Match os="windows" device="desktop">
            <DummyForm title="Windows Native View" icon={Laptop} />
          </AdaptiveActivity.Match>

          <AdaptiveActivity.Match device="mobile">
            <DummyForm title="Mobile View" icon={Smartphone} />
          </AdaptiveActivity.Match>

          <AdaptiveActivity.Match device="tv">
            <DummyForm title="Smart TV View" icon={Tv} />
          </AdaptiveActivity.Match>

          {/* Catch-all fallback */}
          <AdaptiveActivity.Match fallback>
            <DummyForm title="Generic Web View" icon={Monitor} />
          </AdaptiveActivity.Match>
        </AdaptiveActivity>
      </div>
    );
  },
};
