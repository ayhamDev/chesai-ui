"use client";

import { clsx } from "clsx";
import React from "react";
import { Avatar, AvatarProps } from "./index";

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** The maximum number of avatars to display before showing an overflow count. */
  max?: number;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  className,
  max,
  ...props
}) => {
  const childArray = React.Children.toArray(children).filter(
    React.isValidElement
  ) as React.ReactElement<AvatarProps>[];

  const totalAvatars = childArray.length;
  const hasOverflow = max !== undefined && totalAvatars > max;

  const avatarsToShow = hasOverflow ? childArray.slice(0, max) : childArray;
  const overflowCount = totalAvatars - (max || 0);

  const avatarSize = avatarsToShow[0]?.props.size || "md";

  // --- THIS IS THE KEY CHANGE ---
  // We now map avatar sizes to a specific pixel value for the negative margin.
  // This will be used in an inline style object.
  const overlapMargin = {
    xs: "-6px",
    sm: "-10px",
    md: "-14px",
    lg: "-26px",
    xl: "-38px",
  }[avatarSize];
  // --- END OF CHANGE ---

  const hoverEffectClasses =
    "transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:z-50";

  return (
    <div className={clsx("flex items-center", className)} {...props}>
      {avatarsToShow.map((child, index) => {
        // Prepare the style object for each avatar
        const newStyle: React.CSSProperties = {
          ...child.props.style,
          zIndex: index,
        };

        // Apply the negative margin to every avatar EXCEPT the first one
        if (index > 0) {
          newStyle.marginLeft = overlapMargin;
        }

        return React.cloneElement(child, {
          className: clsx(
            child.props.className,
            "ring-2 ring-white dark:ring-graphite-card",
            hoverEffectClasses
          ),
          style: newStyle,
        });
      })}
      {hasOverflow && (
        <Avatar
          variant="count"
          size={avatarSize}
          fallback={`+${overflowCount}`}
          className={clsx(
            "ring-2 ring-white dark:ring-graphite-card",
            hoverEffectClasses
          )}
          // The overflow avatar also gets the negative margin via an inline style
          style={{
            zIndex: max,
            marginLeft: overlapMargin,
          }}
        />
      )}
    </div>
  );
};

AvatarGroup.displayName = "Avatar.Group";
