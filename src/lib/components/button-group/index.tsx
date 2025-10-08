import { clsx } from "clsx";
import React from "react";

// Explicitly define the shape type for clarity and type safety
type ButtonShape = "full" | "minimal" | "sharp";

// Define the component's props
// FIX 1: The wrapping element is now a <fieldset>, so the attributes should match.
interface ButtonGroupProps extends React.HTMLAttributes<HTMLFieldSetElement> {
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
    // FIX 1: Use a more semantic <fieldset> element as suggested by the linter.
    // The role="group" attribute is now implicit.
    // Added border-none and p-0 to reset default fieldset browser styles.
    <fieldset
      className={clsx("inline-flex items-center border-none p-0", className)}
      {...props}
    >
      {childArray.map((child, index) => {
        // FIX 2 & 3: Use a generic type guard to inform TypeScript about the child's props.
        // This ensures child.props is recognized as an object with a potential `className`.
        if (!React.isValidElement<React.HTMLAttributes<HTMLElement>>(child)) {
          return child;
        }

        const isFirst = index === 0;
        const isLast = index === childArray.length - 1;

        // --- NEW, ROBUST LOGIC INSPIRED BY SPLITBUTTON ---
        // Determine the precise rounding classes based on the child's position.
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
          child.props.className, // This is now type-safe
          positionClasses,
          // Create the overlapping border effect for a seamless look.
          !isFirst && "-ml-px",
          // Ensure the focused button renders on top of its siblings.
          "focus:z-10"
        );

        return React.cloneElement(child, {
          ...child.props, // This spread is also now type-safe
          className: newClassName,
        });
      })}
    </fieldset>
  );
};

ButtonGroup.displayName = "ButtonGroup";
