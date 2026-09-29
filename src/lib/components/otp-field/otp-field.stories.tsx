import type { Meta, StoryObj } from "@storybook/react";
import { Typography } from "../typography";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./index";

const meta: Meta<typeof InputOTP> = {
  title: "Components/Forms & Inputs/InputOTP",
  component: InputOTP,
  subcomponents: { InputOTPGroup, InputOTPSlot, InputOTPSeparator },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "filled", // mapped from flat
        "filled-inverted",
        "outlined",
        "underlined",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    isInvalid: { control: "boolean" },
    separated: {
      control: "boolean",
      description:
        "Give each slot its own full shape. Independent of group gap.",
    },
    gap: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg"],
      description:
        "Spacing inside each group, matching ButtonGroup. Retains grouped end shapes when separated is false.",
    },
    activeShape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description:
        "Optional focused-slot shape. Sharp base shapes remain sharp.",
    },
    disabled: { control: "boolean" },
    maxLength: { control: "number" },
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof InputOTP>;

export const Default: Story = {
  name: "1. Default (Filled)",
  args: {
    maxLength: 6,
    variant: "filled", // Was flat
    size: "md",
    shape: "minimal",
  },
  render: (args) => (
    <InputOTP {...args}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const Outlined: Story = {
  name: "2. Outlined Variant",
  args: {
    maxLength: 6,
    variant: "outlined", // Was bordered
    shape: "minimal",
  },
  render: (args) => (
    <InputOTP {...args}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const Underlined: Story = {
  name: "3. Underlined Variant",
  args: {
    maxLength: 4,
    variant: "underlined",
    size: "lg",
  },
  render: (args) => (
    <InputOTP {...args}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const Separated: Story = {
  name: "4. Separated Slots",
  args: {
    maxLength: 6,
    variant: "filled",
    shape: "minimal",
    separated: true,
    size: "md",
  },
  render: (args) => (
    <InputOTP {...args}>
      <InputOTPGroup>
        {Array.from({ length: args.maxLength }, (_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const SeparatedShapes: Story = {
  name: "5. Separated Shapes",
  render: () => (
    <div className="flex flex-col gap-6">
      {(["full", "minimal", "sharp"] as const).map((shape) => (
        <div key={shape} className="flex flex-col gap-2">
          <Typography variant="label-medium">{shape}</Typography>
          <InputOTP
            maxLength={5}
            separated
            shape={shape}
            aria-label={`${shape} verification code`}
          >
            <InputOTPGroup>
              {Array.from({ length: 5 }, (_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      ))}
    </div>
  ),
};

export const GroupedWithGap: Story = {
  name: "6. Grouped With Gap",
  args: {
    maxLength: 6,
    variant: "filled",
    shape: "full",
    gap: "md",
    separated: false,
  },
  render: (args) => (
    <InputOTP {...args} aria-label="Grouped verification code">
      <InputOTPGroup>
        {Array.from({ length: args.maxLength }, (_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const GroupedShapes: Story = {
  name: "7. Joined, Gapped, and Separated Shapes",
  parameters: { layout: "padded" },
  render: () => (
    <div className="p-4 space-y-6 text-on-surface">
      <div>
        <h2 className="text-xl font-semibold">OTP group shapes</h2>
        <p className="text-sm text-on-surface-variant mt-2">
          Group gaps keep the outer ends rounded. Separated slots each get their
          own complete shape.
        </p>
      </div>
      {(["full", "minimal", "sharp"] as const).map((shape) => (
        <section key={shape} className="space-y-3">
          <h3 className="capitalize font-semibold">{shape}</h3>
          <div className="flex flex-wrap gap-x-10 gap-y-5">
            {(["joined", "gapped", "separated"] as const).map((mode) => (
              <div key={mode} className="space-y-2">
                <p className="text-sm text-on-surface-variant capitalize">
                  {mode}
                </p>
                <InputOTP
                  maxLength={4}
                  shape={shape}
                  separated={mode === "separated"}
                  gap={
                    mode === "gapped"
                      ? "md"
                      : mode === "joined"
                        ? "none"
                        : undefined
                  }
                  aria-label={`${shape} ${mode} verification code`}
                >
                  <InputOTPGroup>
                    {[0, 1, 2, 3].map((index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

export const GroupOverrides: Story = {
  name: "8. Per-group Spacing and Active Shape",
  args: { maxLength: 6, variant: "outlined", shape: "full", gap: "none" },
  render: (args) => (
    <div className="space-y-3 text-on-surface">
      <p className="text-sm text-on-surface-variant">
        The first group is joined; the second has a gap and rounded active
        digits.
      </p>
      <InputOTP {...args} aria-label="Verification code with group overrides">
        <InputOTPGroup>
          {[0, 1, 2].map((index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup gap="md" shape="minimal" activeShape="full">
          {[3, 4, 5].map((index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  ),
};
