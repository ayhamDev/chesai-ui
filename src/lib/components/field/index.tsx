"use client";

import { clsx } from "clsx";
import * as React from "react";
import { Typography } from "../typography";

// --- Context ---
const FieldContext = React.createContext<{
  id: string;
  isInvalid: boolean;
} | null>(null);

export const useField = () => React.useContext(FieldContext);

// --- Field Group ---
export const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("flex flex-col gap-6", className)}
    {...props}
  />
));
FieldGroup.displayName = "FieldGroup";

// --- Field ---
export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal";
  /**
   * Defines the validation state.
   * Maps to `data-invalid` for styling hooks.
   */
  "data-invalid"?: boolean;
  /**
   * Alias for data-invalid. Capture this to prevent it from leaking to the DOM.
   */
  isInvalid?: boolean;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      className,
      orientation = "vertical",
      "data-invalid": dataInvalid,
      isInvalid: propIsInvalid,
      id: idProp,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = idProp || generatedId;

    // Consolidate invalid state
    const isInvalid = dataInvalid || propIsInvalid || false;

    return (
      <FieldContext.Provider value={{ id, isInvalid }}>
        <div
          ref={ref}
          id={id}
          data-invalid={isInvalid}
          className={clsx(
            "flex",
            orientation === "vertical"
              ? "flex-col gap-2"
              : "flex-row items-center gap-4 justify-between",
            className,
          )}
          {...props}
        />
      </FieldContext.Provider>
    );
  },
);
Field.displayName = "Field";

// --- Field Label ---
export const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  const context = useField();

  return (
    <label
      ref={ref}
      htmlFor={props.htmlFor || context?.id}
      className={clsx(
        "text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors",
        // Force error color if invalid
        context?.isInvalid ? "text-error" : "text-on-surface",
        className,
      )}
      {...props}
    />
  );
});
FieldLabel.displayName = "FieldLabel";

// --- Field Description ---
export const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<typeof Typography>
>(({ className, ...props }, ref) => {
  const context = useField();
  return (
    <Typography
      as="p"
      ref={ref}
      id={context?.id ? `${context.id}-description` : undefined}
      variant="body-small"
      className={clsx("text-on-surface-variant opacity-80", className)}
      {...props}
    />
  );
});
FieldDescription.displayName = "FieldDescription";

// --- Field Error ---
export interface FieldErrorProps extends React.ComponentProps<
  typeof Typography
> {
  errors?: any[];
}

export const FieldError = React.forwardRef<
  HTMLParagraphElement,
  FieldErrorProps
>(({ className, errors, children, ...props }, ref) => {
  const context = useField();

  // Safely extract string messages from potential objects (e.g. Zod issues)
  const errorContent = React.useMemo(() => {
    if (children) return children;
    if (!errors || !errors.length) return null;

    return errors
      .map((err: unknown) => {
        if (typeof err === "string") return err;
        if (typeof err === "object" && err !== null && "message" in err) {
          return String(err.message);
        }
        return String(err);
      })
      .join(", ");
  }, [errors, children]);

  if (!errorContent) return null;

  return (
    <Typography
      as="p"
      ref={ref}
      id={context?.id ? `${context.id}-error` : undefined}
      variant="body-small"
      // Added font-bold to ensure it stands out, and kept !text-error
      className={clsx("font-medium text-error", className)}
      {...props}
    >
      {errorContent}
    </Typography>
  );
});
FieldError.displayName = "FieldError";
