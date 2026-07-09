// src/lib/components/phone-input/PhoneInput.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { PhoneInput, isValidPhoneNumber, type PhoneInputProps } from "./index";
import { Button } from "../button";
import { LayoutDirectionToggle } from "../layout-toggle";
import { type CountryCode } from "react-phone-number-input";

// Standard localization dictionaries provided by the library
import arLabels from "react-phone-number-input/locale/ar.json";
import frLabels from "react-phone-number-input/locale/fr.json";

const meta: Meta<typeof PhoneInput> = {
  title: "Components/Forms & Inputs/PhoneInput",
  component: PhoneInput,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "filled",
        "filled-inverted",
        "outlined",
        "outlined-inverted",
        "underlined",
        "underlined-inverted",
        "ghost",
        "ghost-inverted",
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
    labelPlacement: {
      control: "select",
      options: ["outside", "outside-left", "inside"],
    },
    defaultCountry: {
      control: "text",
      description: "2-letter ISO Country Code (e.g., US, GB, EG, SA)",
    },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof PhoneInput>;

// --- Helper Stateful Validation Wrapper ---
const PhoneInputWithValidation = (args: any) => {
  const [value, setValue] = useState<string | undefined>();
  const [isFocused, setIsFocused] = useState(false);

  const isValid = value ? isValidPhoneNumber(value) : false;

  // Validation triggers strictly on Blur (unfocused state) to prevent annoying typing errors
  const showInvalid = !!value && !isValid && !isFocused;

  return (
    <div className="w-full flex flex-col gap-4 max-w-sm">
      <PhoneInput
        {...args}
        value={value}
        onValueChange={setValue}
        isInvalid={showInvalid}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        errorMessage="Invalid phone number for the selected country."
        description={
          isValid ? "✓ Number is valid" : "Enter a valid phone number"
        }
      />
      <div className="text-xs bg-surface-container p-3 rounded-lg border border-outline-variant">
        <strong>Raw Output Value:</strong>
        <pre className="mt-1 font-mono text-primary">
          {value || "undefined"}
        </pre>
      </div>
    </div>
  );
};

// --- Stories ---

export const Default: Story = {
  args: {
    label: "Phone Number",
    variant: "outlined",
    defaultCountry: "US",
  },
  render: (args) => <PhoneInputWithValidation {...args} />,
};

export const ControlledState: Story = {
  name: "Controlled State Dashboard",
  render: () => {
    const [value, setValue] = useState<string | undefined>("+966501234567");
    const [country, setCountry] = useState<CountryCode>("SA");

    return (
      <div className="w-full flex flex-col gap-6 max-w-sm bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold opacity-60 uppercase tracking-wide">
            External Country Controllers:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="xs"
              variant={country === "SA" ? "primary" : "outline"}
              onClick={() => {
                setCountry("SA");
                setValue("+966501234567");
              }}
            >
              Saudi Arabia (+966)
            </Button>
            <Button
              size="xs"
              variant={country === "EG" ? "primary" : "outline"}
              onClick={() => {
                setCountry("EG");
                setValue("+201012345678");
              }}
            >
              Egypt (+20)
            </Button>
            <Button
              size="xs"
              variant={country === "GB" ? "primary" : "outline"}
              onClick={() => {
                setCountry("GB");
                setValue("+447911123456");
              }}
            >
              United Kingdom (+44)
            </Button>
          </div>
        </div>

        <PhoneInput
          label="Controlled Inputs"
          country={country}
          onCountryChange={setCountry}
          value={value}
          onValueChange={setValue}
          variant="outlined-inverted"
          shape="minimal"
        />

        <div className="text-xs bg-surface-container p-4 rounded-xl border border-outline-variant/50 flex flex-col gap-1">
          <p>
            <strong>Active Controlled Country:</strong>{" "}
            <span className="font-mono text-primary">{country}</span>
          </p>
          <p>
            <strong>Standardized Value (E.164):</strong>{" "}
            <span className="font-mono text-primary">
              {value || "undefined"}
            </span>
          </p>
        </div>
      </div>
    );
  },
};

export const Sizes: Story = {
  name: "All Sizing Classes",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <PhoneInput
        label="Small (sm)"
        size="sm"
        defaultCountry="US"
        variant="filled"
      />
      <PhoneInput
        label="Medium (md)"
        size="md"
        defaultCountry="US"
        variant="filled"
      />
      <PhoneInput
        label="Large (lg)"
        size="lg"
        defaultCountry="US"
        variant="filled"
      />
    </div>
  ),
};

export const Shapes: Story = {
  name: "All Rounding Shapes",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <PhoneInput
        label="Minimal (Default)"
        shape="minimal"
        defaultCountry="SA"
        variant="outlined"
      />
      <PhoneInput
        label="Full (Rounded Pill)"
        shape="full"
        defaultCountry="SA"
        variant="outlined"
      />
      <PhoneInput
        label="Sharp (Square)"
        shape="sharp"
        defaultCountry="SA"
        variant="outlined"
      />
    </div>
  ),
};

export const VisualVariants: Story = {
  name: "All Theme Variants",
  render: () => (
    <div className="w-full flex flex-col gap-6 max-w-sm">
      <PhoneInput label="Filled" variant="filled" defaultCountry="EG" />
      <PhoneInput
        label="Filled Inverted"
        variant="filled-inverted"
        defaultCountry="EG"
      />
      <PhoneInput label="Outlined" variant="outlined" defaultCountry="EG" />
      <PhoneInput
        label="Outlined Inverted"
        variant="outlined-inverted"
        defaultCountry="EG"
      />
      <PhoneInput label="Underlined" variant="underlined" defaultCountry="EG" />
      <PhoneInput label="Ghost" variant="ghost" defaultCountry="EG" />
    </div>
  ),
};

export const WithRtlAndLocalization: Story = {
  name: "RTL Layout & Arabic Localization",
  args: {
    label: "رقم الهاتف",
    variant: "outlined",
    defaultCountry: "EG",
    labelPlacement: "outside",
    labels: arLabels, // Converts country select labels to Arabic natively
  },
  render: (args) => (
    <div className="w-full max-w-sm flex flex-col gap-4">
      <LayoutDirectionToggle />
      <PhoneInputWithValidation {...args} />
    </div>
  ),
};

export const FrenchLocalization: Story = {
  name: "French Translation",
  args: {
    label: "Numéro de Téléphone",
    variant: "filled-inverted",
    defaultCountry: "FR",
    labels: frLabels, // Converts country select list to French
  },
  render: (args) => <PhoneInputWithValidation {...args} />,
};
