import React from "react";
import { clsx } from "clsx";

// Defines the mapping from our component 'variant' prop to the CSS classes
// defined in src/lib/tailwind/typography.css
const variants = {
  // --- MD3 Token Mappings ---
  "display-large": "display-large text-on-surface",
  "display-medium": "display-medium text-on-surface",
  "display-small": "display-small text-on-surface",

  "headline-large": "headline-large text-on-surface",
  "headline-medium": "headline-medium text-on-surface",
  "headline-small": "headline-small text-on-surface",

  "title-large": "title-large text-on-surface",
  "title-medium": "title-medium text-on-surface",
  "title-small": "title-small text-on-surface",

  "body-large": "body-large text-on-surface",
  "body-medium": "body-medium text-on-surface",
  "body-small": "body-small text-on-surface",

  "label-large": "label-large text-on-surface",
  "label-medium": "label-medium text-on-surface",
  "label-small": "label-small text-on-surface",

  // --- Legacy / Semantic Aliases (Mapped to closest MD3 equivalent) ---
  h1: "headline-large text-on-surface",
  h2: "headline-medium text-on-surface",
  h3: "headline-small text-on-surface",
  h4: "title-large text-on-surface",
  p: "body-large text-on-surface",
  lead: "body-large text-on-surface-variant",
  large: "body-large font-semibold text-on-surface",
  small: "body-small text-on-surface",
  muted: "body-medium text-on-surface-variant",
  blockquote:
    "body-large text-on-surface-variant border-l-2 border-primary pl-4 italic my-4",
  code: "relative rounded bg-secondary-container px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-on-secondary-container",
};

// Defines the default HTML tag for each variant if 'as' prop is not provided
const variantToTagMap: Record<keyof typeof variants, React.ElementType> = {
  // MD3
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

  // Legacy
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
) => React.ReactElement | null) & {
  displayName?: string;
};

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
    // Determine the HTML tag: User prop > Map > Fallback "p"
    const Component = as || variantToTagMap[variant] || "p";

    // Get the CSS class from the map. Fallback to body-medium if invalid variant passed.
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
