"use client";

import { clsx } from "clsx";
import React from "react";
import { Avatar, type AvatarProps } from "./index";

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
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

  const overlapMargin = {
    xs: "-6px",
    sm: "-10px",
    md: "-14px",
    lg: "-26px",
    xl: "-38px",
  }[avatarSize];

  const hoverEffectClasses =
    "transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:z-50";

  return (
    <div className={clsx("flex items-center", className)} {...props}>
      {avatarsToShow.map((child, index) => {
        const newStyle: React.CSSProperties = {
          ...child.props.style,
          zIndex: index,
        };

        if (index > 0) {
          newStyle.marginLeft = overlapMargin;
        }

        return React.cloneElement(child, {
          className: clsx(
            child.props.className,
            // Ring matches the surface behind it (usually background or card)
            "ring-2 ring-surface",
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
          className={clsx("ring-2 ring-surface", hoverEffectClasses)}
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
