"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import React from "react";

const variants = {
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

  blockquote:
    "body-large border-l-4 border-primary pl-4 italic my-4 opacity-80",
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
  blockquote: "blockquote",
};

const highlightVariants = cva(
  "font-plain text-sm font-semibold inline-block align-baseline leading-none mx-0.5",
  {
    variants: {
      highlightedVariant: {
        primary: "bg-primary-container text-on-primary-container",
        secondary: "bg-secondary-container text-on-secondary-container",
        tertiary: "bg-tertiary-container text-on-tertiary-container",
        error: "bg-error-container text-on-error-container",
      },
      highlightedShape: {
        full: "rounded-full px-2.5 py-0.5",
        minimal: "rounded-md px-1.5 py-0.5",
        sharp: "rounded-none px-1.5 py-0.5",
      },
    },
    defaultVariants: {
      highlightedVariant: "secondary",
      highlightedShape: "minimal",
    },
  },
);

type TypographyOwnProps = {
  variant?: keyof typeof variants;
  className?: string;
  highlighted?: boolean;
  muted?: boolean;
  bold?: boolean;
  highlightedVariant?: "primary" | "secondary" | "tertiary" | "error";
  highlightedShape?: "full" | "minimal" | "sharp";
};

type PolymorphicComponentProps<
  C extends React.ElementType,
  P extends object,
> = P & Omit<React.ComponentPropsWithoutRef<C>, keyof P>;

type TypographyProps<C extends React.ElementType> = PolymorphicComponentProps<
  C,
  TypographyOwnProps & { as?: C }
>;

type TypographyComponent = <C extends React.ElementType = "p">(
  props: TypographyProps<C> & { ref?: React.ComponentPropsWithRef<C>["ref"] },
) => React.ReactElement | null;

const TypographyInner = (
  {
    as,
    variant = "body-medium",
    className,
    children,
    highlighted = false,
    muted = false,
    bold = false,
    highlightedVariant,
    highlightedShape,
    ...restProps
  }: TypographyProps<React.ElementType>,
  ref: React.ForwardedRef<HTMLElement>,
) => {
  const Component = as || variantToTagMap[variant] || "p";

  const variantClass = variants[variant] || variants["body-medium"];

  const highlightClass = highlighted
    ? highlightVariants({ highlightedVariant, highlightedShape })
    : "";

  const mutedClass = muted ? "opacity-60" : "";
  const boldClass = bold ? "font-bold!" : "";

  const combinedClassName = clsx(
    variantClass,
    highlightClass,
    mutedClass,
    boldClass,
    className,
  );

  return (
    <Component ref={ref} className={combinedClassName} {...restProps}>
      {children}
    </Component>
  );
};

export const Typography = React.forwardRef(
  TypographyInner,
) as unknown as TypographyComponent;

(Typography as any).displayName = "Typography";
