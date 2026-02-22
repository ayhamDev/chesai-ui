import type { Meta, StoryObj } from "@storybook/react";
import { User, CreditCard, CheckCircle2 } from "lucide-react";
import { Stepper } from "./index";

const meta: Meta<typeof Stepper> = {
  title: "Components/Feedback/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

export const Horizontal: Story = {
  args: { currentStep: 1, orientation: "horizontal" },
  render: (args) => (
    <div className="w-full max-w-3xl pt-8 pb-16">
      <Stepper {...args}>
        <Stepper.Step>
          <Stepper.Indicator icon={<User className="h-4 w-4" />} />
          <Stepper.Separator />
          <Stepper.Content>
            <Stepper.Title>Account</Stepper.Title>
            <Stepper.Description>Create your account</Stepper.Description>
          </Stepper.Content>
        </Stepper.Step>
        <Stepper.Step>
          <Stepper.Indicator icon={<CreditCard className="h-4 w-4" />} />
          <Stepper.Separator />
          <Stepper.Content>
            <Stepper.Title>Payment</Stepper.Title>
            <Stepper.Description>Enter payment details</Stepper.Description>
          </Stepper.Content>
        </Stepper.Step>
        <Stepper.Step>
          <Stepper.Indicator icon={<CheckCircle2 className="h-4 w-4" />} />
          <Stepper.Content>
            <Stepper.Title>Confirm</Stepper.Title>
            <Stepper.Description>Review your order</Stepper.Description>
          </Stepper.Content>
        </Stepper.Step>
      </Stepper>
    </div>
  ),
};

export const VerticalTimeline: Story = {
  args: { currentStep: 2, orientation: "vertical" },
  render: (args) => (
    <div className="pl-8">
      <Stepper {...args}>
        <Stepper.Step>
          <Stepper.Indicator />
          <Stepper.Separator />
          <Stepper.Content>
            <Stepper.Title>Order Placed</Stepper.Title>
            <Stepper.Description>
              We have received your order.
            </Stepper.Description>
          </Stepper.Content>
        </Stepper.Step>
        <Stepper.Step>
          <Stepper.Indicator />
          <Stepper.Separator />
          <Stepper.Content>
            <Stepper.Title>Processing</Stepper.Title>
            <Stepper.Description>
              Your order is being prepared.
            </Stepper.Description>
          </Stepper.Content>
        </Stepper.Step>
        <Stepper.Step>
          <Stepper.Indicator />
          <Stepper.Separator />
          <Stepper.Content>
            <Stepper.Title>Shipped</Stepper.Title>
            <Stepper.Description>
              Package has left the facility.
            </Stepper.Description>
          </Stepper.Content>
        </Stepper.Step>
        <Stepper.Step>
          <Stepper.Indicator />
          <Stepper.Content>
            <Stepper.Title>Delivered</Stepper.Title>
          </Stepper.Content>
        </Stepper.Step>
      </Stepper>
    </div>
  ),
};
