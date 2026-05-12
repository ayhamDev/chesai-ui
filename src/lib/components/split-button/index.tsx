import { clsx } from "clsx";
import React from "react";

type ButtonShape = "full" | "minimal" | "sharp";

type SplitButtonChildren = [
  React.ReactElement<{ className?: string }>,
  React.ReactElement<{ className?: string }>,
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
  if (React.Children.count(children) !== 2) {
    console.error("SplitButton requires exactly two children.");
    return null;
  }

  const [mainAction, dropdownTrigger] = children;

  // 1. We use !important to guarantee the inner Button's default shape is overridden.
  // 2. For 'full', we use 40px instead of '9999px'. 40px is a perfect semicircle for buttons,
  //    but it prevents the browser's border-radius clamping algorithm from squashing the tiny 2px inner curve.

  const clonedMainAction = React.cloneElement(mainAction, {
    className: clsx(
      mainAction.props.className,
      shape === "full"
        ? "!rounded-l-[40px]"
        : shape === "minimal"
          ? "!rounded-l-lg"
          : "!rounded-l-none",
      shape === "sharp" ? "!rounded-r-none" : "!rounded-r-[5px]",
    ),
  });

  const clonedDropdownTrigger = React.cloneElement(dropdownTrigger, {
    className: clsx(
      dropdownTrigger.props.className,
      shape === "full"
        ? "!rounded-r-[40px]"
        : shape === "minimal"
          ? "!rounded-r-lg"
          : "!rounded-r-none",
      shape === "sharp" ? "!rounded-l-none" : "!rounded-l-[5px]",
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
