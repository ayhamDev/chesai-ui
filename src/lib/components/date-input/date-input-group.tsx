"use client";

import { clsx } from "clsx";
import React, { forwardRef, useMemo } from "react";
import { dateInputSlots } from "./date-input-styles";

export interface DateInputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  isInvalid?: boolean;
  shouldLabelBeOutside?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;

  // Slot Props
  labelProps?: React.HTMLAttributes<HTMLElement>;
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
  innerWrapperProps?: React.HTMLAttributes<HTMLDivElement>;
  helperWrapperProps?: React.HTMLAttributes<HTMLDivElement>;
  errorMessageProps?: React.HTMLAttributes<HTMLDivElement>;
  descriptionProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const DateInputGroup = forwardRef<HTMLDivElement, DateInputGroupProps>(
  (props, ref) => {
    const {
      children,
      label,
      description,
      errorMessage,
      isInvalid,
      shouldLabelBeOutside,
      startContent,
      endContent,
      labelProps,
      wrapperProps,
      innerWrapperProps,
      helperWrapperProps,
      errorMessageProps,
      descriptionProps,
      ...otherProps
    } = props;

    const labelContent = label ? <span {...labelProps}>{label}</span> : null;

    const hasHelper = !!description || (isInvalid && !!errorMessage);

    const helperWrapper = useMemo(() => {
      if (!hasHelper) return null;

      return (
        <div {...helperWrapperProps}>
          {isInvalid && errorMessage ? (
            <div {...errorMessageProps}>{errorMessage}</div>
          ) : (
            <div {...descriptionProps}>{description}</div>
          )}
        </div>
      );
    }, [
      hasHelper,
      isInvalid,
      errorMessage,
      description,
      helperWrapperProps,
      errorMessageProps,
      descriptionProps,
    ]);

    return (
      <div ref={ref} {...otherProps} data-slot="base">
        {shouldLabelBeOutside ? labelContent : null}

        <div {...wrapperProps}>
          {!shouldLabelBeOutside ? labelContent : null}
          <div {...innerWrapperProps}>
            {startContent}
            {children}
            {endContent}
          </div>
        </div>

        {helperWrapper}
      </div>
    );
  },
);

DateInputGroup.displayName = "DateInputGroup";
