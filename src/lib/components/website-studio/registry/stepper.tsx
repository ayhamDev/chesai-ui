import React from "react";
import * as Icons from "lucide-react";
import { Stepper } from "../../stepper";
import type { RegistryComponent } from "../types";

export const StepperConfig: RegistryComponent = {
  name: "Stepper / Timeline",
  category: "Feedback",
  render: ({ stepsString, currentStep, orientation, variant, ...props }) => {
    const parsedSteps = (stepsString || "Account:Create account:User, Payment:Details:CreditCard, Confirm:Review:CheckCircle2")
      .split(",")
      .map((step: string) => {
        const [titlePart, descPart, iconPart] = step.split(":");
        return {
          title: titlePart ? titlePart.trim() : "Step",
          desc: descPart ? descPart.trim() : "",
          icon: iconPart ? iconPart.trim() : undefined,
        };
      });

    return (
      <div className="w-full flex justify-center py-4" {...props}>
        <Stepper currentStep={currentStep} orientation={orientation} variant={variant}>
          {parsedSteps.map((step: any, index: number) => {
            const IconComp = step.icon && (Icons as any)[step.icon] ? (Icons as any)[step.icon] : null;
            return (
              <Stepper.Step key={index}>
                <Stepper.Indicator icon={IconComp ? <IconComp className="h-4 w-4" /> : undefined} />
                <Stepper.Separator />
                <Stepper.Content>
                  <Stepper.Title>{step.title}</Stepper.Title>
                  {step.desc && <Stepper.Description>{step.desc}</Stepper.Description>}
                </Stepper.Content>
              </Stepper.Step>
            );
          })}
        </Stepper>
      </div>
    );
  },
  controls: {
    stepsString: {
      type: "textarea",
      label: "Steps (Title:Description:Icon)",
      description: "Comma separated parts.",
      defaultValue: "Account:Create account:User, Payment:Details:CreditCard, Confirm:Review:CheckCircle2",
      group: "Content",
    },
    currentStep: {
      type: "number",
      label: "Current Step Index",
      defaultValue: 1,
      min: 0,
      max: 10,
      step: 1,
      group: "State",
    },
    orientation: {
      type: "select",
      label: "Orientation",
      group: "Layout",
      defaultValue: "horizontal",
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical", value: "vertical" },
      ],
    },
    variant: {
      type: "select",
      label: "Color Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
      ],
    },
  },
};
