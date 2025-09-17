import React from "react";
import { clsx } from "clsx";

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

  return (
    <div
      className={clsx("inline-flex items-center", className)}
      role="group" // Important for accessibility
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        // Skip over any non-element children (like text nodes or nulls)
        if (!React.isValidElement(child)) {
          return child;
        }

        // Safely cast the child to a type we can work with
        const typedChild = child as React.ReactElement<{ className?: string }>;

        const isFirst = index === 0;
        const isLast = React.Children.count(children) - 1 === index;

        // Build the new class names to inject into the child
        const newClassName = clsx(
          typedChild.props.className,
          // 1. Force all inner corners to be sharp
          "!rounded-none",
          // 2. Add back the correct rounding to the first and last items
          isFirst && shapeClasses[shape].left,
          isLast && shapeClasses[shape].right,
          // 3. Create the overlapping border effect for a seamless look
          !isFirst && "-ml-px",
          // 4. Ensure the focused button renders on top of its siblings
          "focus:z-10"
        );

        // Clone the child element and apply the new, combined className
        return React.cloneElement(typedChild, {
          ...typedChild.props,
          className: newClassName,
        });
      })}
    </div>
  );
};

ButtonGroup.displayName = "ButtonGroup";
