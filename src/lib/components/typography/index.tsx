"use client";

import React from "react";
import { clsx } from "clsx";

// Removed "text-on-surface" and "text-on-surface-variant" from these strings
// to allow inheritance from parents like High Contrast Cards.
const variants = {
  // --- MD3 Token Mappings ---
  "display-large": "display-large",
  "display-medium": "display-medium",
  "display-small": "display-small",

  "headline-large": "headline-large",
  "headline-medium": "headline-medium",
  "headline-small": "headline-small",

  "title-large": "title-large",
  "title-medium": "title-medium",
  "title-small": "title-small",

  "body-large": "body-large",
  "body-medium": "body-medium",
  "body-small": "body-small",

  "label-large": "label-large",
  "label-medium": "label-medium",
  "label-small": "label-small",

  // --- Legacy / Semantic Aliases ---
  h1: "headline-large",
  h2: "headline-medium",
  h3: "headline-small",
  h4: "title-large",
  p: "body-large",
  lead: "body-large opacity-80", // Replaced color class with opacity for better inheritance
  large: "body-large font-semibold",
  small: "body-small",
  muted: "body-medium opacity-70",
  blockquote:
    "body-large border-l-2 border-primary pl-4 italic my-4 opacity-80",
  code: "relative rounded bg-secondary-container px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-on-secondary-container",
};

const variantToTagMap: Record<keyof typeof variants, React.ElementType> = {
  "display-large": "h1",
  "display-medium": "h1",
  "display-small": "h1",
  "headline-large": "h2",
  "headline-medium": "h3",
  "headline-small": "h4",
  "title-large": "h5",
  "title-medium": "h6",
  "title-small": "h6",
  "body-large": "p",
  "body-medium": "p",
  "body-small": "p",
  "label-large": "span",
  "label-medium": "span",
  "label-small": "span",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  p: "p",
  lead: "p",
  large: "div",
  small: "small",
  muted: "p",
  blockquote: "blockquote",
  code: "code",
};

type TypographyOwnProps = {
  variant?: keyof typeof variants;
  className?: string;
};

type PolymorphicComponentProps<
  C extends React.ElementType,
  P extends object,
> = P & Omit<React.ComponentPropsWithoutRef<C>, keyof P>;

type TypographyProps<C extends React.ElementType> = PolymorphicComponentProps<
  C,
  TypographyOwnProps & { as?: C }
>;

type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>["ref"];

type TypographyComponent = (<C extends React.ElementType = "p">(
  props: TypographyProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null) & { displayName?: string };

export const Typography = React.forwardRef(
  <C extends React.ElementType = "p">(
    {
      as,
      variant = "body-medium",
      className,
      children,
      ...restProps
    }: TypographyProps<C>,
    ref?: PolymorphicRef<C>,
  ) => {
    const Component = as || variantToTagMap[variant] || "p";
    const variantClass = variants[variant] || variants["body-medium"];
    const combinedClassName = clsx(variantClass, className);

    return (
      <Component ref={ref} className={combinedClassName} {...restProps}>
        {children}
      </Component>
    );
  },
) as TypographyComponent;

Typography.displayName = "Typography";
