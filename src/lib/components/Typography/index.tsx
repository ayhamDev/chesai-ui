import React from "react";

const variants = {
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
  h2: "scroll-m-20  text-3xl font-semibold tracking-tight first:mt-0",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
  h4: "scroll-m-20 text-xl font-semibold tracking-tight",
  p: "leading-7 [&:not(:first-child)]:mt-6",
  blockquote:
    "mt-6 border-l-2 border-graphite-primary pl-6 italic text-gray-600",
  highlight:
    "relative rounded bg-graphite-secondary px-[0.3rem] py-[0.2rem] text-sm font-semibold text-graphite-secondaryForeground",
  lead: "text-xl text-gray-500",
  large: "text-lg font-semibold",
  small: "text-sm font-medium leading-none",
  muted: "text-sm text-gray-500",
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

// 1. Define the component's specific props
type TypographyOwnProps = {
  variant: keyof typeof variants;
  className?: string;
};

// 2. Create a refined generic props type for the polymorphic component
// This type merges the component's own props (P) with the native props
// of the element (C), while ensuring no keys are accidentally omitted.
type PolymorphicComponentProps<
  C extends React.ElementType,
  P extends object
> = P & Omit<React.ComponentPropsWithoutRef<C>, keyof P>;

// 3. Create the final props type for our Typography component
// We add 'as' to the TypographyOwnProps to make it an explicit part of our own props.
type TypographyProps<C extends React.ElementType> = PolymorphicComponentProps<
  C,
  TypographyOwnProps & { as?: C }
>;

// 4. Create a generic Ref type
type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>["ref"];

// 5. Define the component's function signature with the correct types and a displayName property
type TypographyComponent = (<C extends React.ElementType = "p">(
  props: TypographyProps<C> & { ref?: PolymorphicRef<C> }
) => React.ReactElement | null) & {
  displayName?: string;
};

// 6. Implement the component using forwardRef and the correct types.
// We cast the result to TypographyComponent to ensure all type declarations are met.
export const Typography = React.forwardRef(
  <C extends React.HTMLElementType = "p">(
    { as, variant, className, children, ...restProps }: TypographyProps<C>,
    ref?: PolymorphicRef<C>
  ) => {
    const Component = as || variantToTagMap[variant] || "p";
    const combinedClassName = `${variants[variant]} ${className || ""}`.trim();

    return (
      <Component ref={ref} className={combinedClassName} {...restProps}>
        {children}
      </Component>
    );
  }
) as TypographyComponent;

Typography.displayName = "Typography";
