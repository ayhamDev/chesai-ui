import { clsx } from "clsx";
import React from "react";

type ButtonShape = "full" | "minimal" | "sharp";
type ButtonGap = "none" | "xs" | "sm" | "md" | "lg";

interface ButtonGroupProps extends React.HTMLAttributes<HTMLFieldSetElement> {
  children: React.ReactNode;
  shape?: ButtonShape;
  gap?: ButtonGap;
  activeShape?: ButtonShape;
}

const gapClasses: Record<ButtonGap, string> = {
  none: "gap-0",
  xs: "gap-px",
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-2",
};

const getButtonShapeClasses = (
  index: number,
  total: number,
  shape: ButtonShape,
  hasGap: boolean,
  isActive?: boolean,
  activeShape?: ButtonShape,
) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const isOnly = total === 1;

  if (shape === "sharp") return "!rounded-none";

  // If the button is active, apply a finite capsule rounding override
  if (isActive && activeShape) {
    if (activeShape === "full") return "!rounded-[30px]"; // Finite value to prevent animation overshoot
    if (activeShape === "minimal") return "!rounded-xl";
    if (activeShape === "sharp") return "!rounded-none";
  }

  if (isOnly) {
    if (shape === "full") return "!rounded-[30px]"; // Finite value
    if (shape === "minimal") return "!rounded-xl";
  }

  if (hasGap) {
    if (shape === "full") {
      if (isFirst) return "!rounded-l-[30px] !rounded-r-md";
      if (isLast) return "!rounded-l-md !rounded-r-[30px]";
      return "!rounded-md";
    }

    if (shape === "minimal") {
      if (isFirst) return "!rounded-l-xl !rounded-r-md";
      if (isLast) return "!rounded-l-md !rounded-r-xl";
      return "!rounded-md";
    }
  } else {
    // Seamless layout using finite radius values for smooth transitions
    if (shape === "full") {
      if (isFirst) return "!rounded-l-[30px] !rounded-r-none";
      if (isLast) return "!rounded-l-none !rounded-r-[30px]";
      return "!rounded-none";
    }

    if (shape === "minimal") {
      if (isFirst) return "!rounded-l-xl !rounded-r-none";
      if (isLast) return "!rounded-l-none !rounded-r-xl";
      return "!rounded-none";
    }
  }
  return "";
};

export const ButtonGroup = ({
  children,
  className,
  shape = "full",
  gap = "none",
  activeShape = "full",
  ...props
}: ButtonGroupProps) => {
  const childArray = React.Children.toArray(children).filter(
    React.isValidElement,
  );
  const hasGap = gap !== "none";

  return (
    <fieldset
      className={clsx(
        "inline-flex items-center border-none p-0 m-0",
        gapClasses[gap],
        className,
      )}
      {...props}
    >
      {childArray.map((child, index) => {
        const isFirst = index === 0;
        const childProps = (child as React.ReactElement<any>).props;
        const isActive = childProps.isActive;

        const shapeClass = getButtonShapeClasses(
          index,
          childArray.length,
          shape,
          hasGap,
          isActive,
          activeShape,
        );

        const newClassName = clsx(
          childProps.className,
          shapeClass,
          !isFirst && !hasGap && "-ml-px",
          "focus:z-10",
        );

        // We override the button's internal shape prop to 'sharp' (rounded-none)
        // to prevent base 'rounded-full' (9999px) from conflicting with smooth CSS transitions.
        return React.cloneElement(child as React.ReactElement<any>, {
          className: newClassName,
          shape: "sharp",
        });
      })}
    </fieldset>
  );
};

ButtonGroup.displayName = "ButtonGroup";
