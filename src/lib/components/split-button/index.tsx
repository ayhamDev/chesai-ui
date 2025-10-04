import { clsx } from "clsx";
import React from "react";

type ButtonShape = "full" | "minimal" | "sharp";

// Define a type for the children we expect. They must be ReactElements
// and we expect them to have a className prop.
type SplitButtonChildren = [
  React.ReactElement<{ className?: string }>,
  React.ReactElement<{ className?: string }>
];

interface SplitButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: SplitButtonChildren;
  shape?: ButtonShape;
}

export const SplitButton = ({
  children,
  className,
  shape = "full",
  ...props
}: SplitButtonProps) => {
  // A runtime check for safety, though TypeScript now enforces the type
  if (React.Children.count(children) !== 2) {
    console.error("SplitButton requires exactly two children.");
    return null;
  }

  // TypeScript now knows mainAction and dropdownTrigger have a .props.className property
  const [mainAction, dropdownTrigger] = children;

  const shapeClasses: Record<ButtonShape, { left: string; right: string }> = {
    full: { left: "rounded-l-full", right: "rounded-r-full" },
    minimal: { left: "rounded-l-lg", right: "rounded-r-lg" },
    sharp: { left: "rounded-l-none", right: "rounded-r-none" },
  };

  const clonedMainAction = React.cloneElement(mainAction, {
    className: clsx(
      mainAction.props.className, // No more error here
      shapeClasses[shape].left,
      shape === "sharp" ? "!rounded-r-none" : "!rounded-r-xs"
    ),
  });

  const clonedDropdownTrigger = React.cloneElement(dropdownTrigger, {
    className: clsx(
      dropdownTrigger.props.className, // No more error here
      shapeClasses[shape].right,
      shape === "sharp" ? "!rounded-l-none" : "!rounded-l-xs"
    ),
  });

  return (
    <div
      className={clsx("inline-flex items-center gap-0.5", className)}
      {...props}
    >
      {clonedMainAction}
      {clonedDropdownTrigger}
    </div>
  );
};

SplitButton.displayName = "SplitButton";
