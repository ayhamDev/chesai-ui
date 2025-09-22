import { clsx } from "clsx";
import React from "react";

// Explicitly define the shape type for clarity and type safety
type ButtonShape = "full" | "minimal" | "sharp";

// Define the component's props
interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  shape?: ButtonShape;
}

export const ButtonGroup = ({
  children,
  className,
  shape = "full",
  ...props
}: ButtonGroupProps) => {
  // Map the shape prop to the correct Tailwind CSS classes for the outer corners
  const shapeClasses: Record<ButtonShape, { left: string; right: string }> = {
    full: { left: "rounded-l-full", right: "rounded-r-full" },
    minimal: { left: "rounded-l-lg", right: "rounded-r-lg" },
    sharp: { left: "rounded-l-none", right: "rounded-r-none" },
  };

  const childArray = React.Children.toArray(children);

  return (
    <div
      className={clsx("inline-flex items-center", className)}
      role="group" // Important for accessibility
      {...props}
    >
      {childArray.map((child, index) => {
        if (!React.isValidElement(child)) {
          return child;
        }

        const isFirst = index === 0;
        const isLast = index === childArray.length - 1;

        // --- NEW, ROBUST LOGIC INSPIRED BY SPLITBUTTON ---
        // Determine the precise rounding classes based on the child's position.
        // This is more explicit and reliable than trying to reset with '!rounded-none'.
        let positionClasses = "";
        if (isFirst) {
          // The first child gets the group's left rounding and a sharp right corner.
          positionClasses = clsx(shapeClasses[shape].left, "rounded-r-none");
        } else if (isLast) {
          // The last child gets the group's right rounding and a sharp left corner.
          positionClasses = clsx(shapeClasses[shape].right, "rounded-l-none");
        } else {
          // All middle children are forced to be sharp on both sides.
          positionClasses = "rounded-none";
        }

        const newClassName = clsx(
          child.props.className,
          positionClasses,
          // Create the overlapping border effect for a seamless look.
          !isFirst && "-ml-px",
          // Ensure the focused button renders on top of its siblings.
          "focus:z-10"
        );

        return React.cloneElement(child, {
          ...child.props,
          className: newClassName,
        });
      })}
    </div>
  );
};

ButtonGroup.displayName = "ButtonGroup";
