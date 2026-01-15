import React from "react";

const variants = {
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-on-surface",
  h2: "scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 text-on-surface",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight text-on-surface",
  h4: "scroll-m-20 text-xl font-semibold tracking-tight text-on-surface",
  p: "leading-7 [&:not(:first-child)]:mt-6 text-on-surface",
  blockquote:
    "mt-6 border-l-2 border-primary pl-6 italic text-on-surface-variant",
  highlight:
    "relative rounded bg-secondary-container px-[0.3rem] py-[0.2rem] text-sm font-semibold text-on-secondary-container",
  lead: "text-xl text-on-surface-variant",
  large: "text-lg font-semibold text-on-surface",
  small: "text-sm font-medium leading-none text-on-surface",
  muted: "text-sm text-on-surface-variant",
};

const variantToTagMap: Record<keyof typeof variants, React.ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  p: "p",
  blockquote: "blockquote",
  highlight: "span",
  lead: "p",
  large: "div",
  small: "small",
  muted: "p",
};

type TypographyOwnProps = {
  variant?: keyof typeof variants;
  className?: string;
};

type PolymorphicComponentProps<
  C extends React.ElementType,
  P extends object
> = P & Omit<React.ComponentPropsWithoutRef<C>, keyof P>;

type TypographyProps<C extends React.ElementType> = PolymorphicComponentProps<
  C,
  TypographyOwnProps & { as?: C }
>;

type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>["ref"];

type TypographyComponent = (<C extends React.ElementType = "p">(
  props: TypographyProps<C> & { ref?: PolymorphicRef<C> }
) => React.ReactElement | null) & {
  displayName?: string;
};

export const Typography = React.forwardRef(
  <C extends React.ElementType = "p">(
    { as, variant, className, children, ...restProps }: TypographyProps<C>,
    ref?: PolymorphicRef<C>
  ) => {
    const Component = as || variantToTagMap[variant] || "p";
    // @ts-ignore
    const combinedClassName = `${variants[variant]} ${className || ""}`.trim();

    return (
      <Component ref={ref} className={combinedClassName} {...restProps}>
        {children}
      </Component>
    );
  }
) as TypographyComponent;

Typography.displayName = "Typography";
