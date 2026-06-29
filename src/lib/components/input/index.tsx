// src/lib/components/input/index.tsx

"use client";

import { X, Eye, EyeOff } from "lucide-react";
import React, { forwardRef, useMemo } from "react";
import { type UseInputProps, useInput } from "./use-input";

export { inputWrapperVariants } from "./input-styles";

export interface InputProps extends UseInputProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    Component,
    value,
    label,
    description,
    isClearable,
    startContent,
    endContent,
    shouldLabelBeOutside,
    errorMessage,
    isInvalid,
    // Dynamic password toggle context fetched from hook
    originalType,
    isPasswordVisible,
    setIsPasswordVisible,
    getBaseProps,
    getLabelProps,
    getInputProps,
    getInnerWrapperProps,
    getInputWrapperProps,
    getHelperWrapperProps,
    getDescriptionProps,
    getErrorMessageProps,
    getClearButtonProps,
  } = useInput({ ...props, ref });

  const labelContent = label ? (
    <label {...getLabelProps()}>{label}</label>
  ) : null;

  // Re-constructed end area to support clear, eye/eye-off toggle, and custom elements together
  const end = useMemo(() => {
    const endElements: React.ReactNode[] = [];

    // 1. Render clear button if enabled and input has value
    if (isClearable && value) {
      endElements.push(
        <button key="clear" {...getClearButtonProps()}>
          <X className="h-4 w-4" />
        </button>,
      );
    }

    // 2. Render dynamic password toggle if original type is 'password'
    if (originalType === "password") {
      endElements.push(
        <button
          key="password-toggle"
          type="button"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          // Styles designed to perfectly match the design system's clearButton variables
          className="p-2 -m-2 z-10 select-none transition-opacity text-on-surface-variant hover:text-on-surface cursor-pointer active:opacity-70 rounded-full"
        >
          {isPasswordVisible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>,
      );
    }

    // 3. Append custom endContent if provided by parent
    if (endContent) {
      endElements.push(
        <React.Fragment key="custom-end">{endContent}</React.Fragment>,
      );
    }

    if (endElements.length === 0) return null;

    // Wrap multiple trailing actions inside a unified flex layout matching design-system metrics
    return (
      <div className="flex items-center gap-2 shrink-0">{endElements}</div>
    );
  }, [
    isClearable,
    value,
    originalType,
    isPasswordVisible,
    setIsPasswordVisible,
    getClearButtonProps,
    endContent,
  ]);

  const helperWrapper = useMemo(() => {
    const shouldShowError = isInvalid && errorMessage;
    const hasContent = shouldShowError || description;

    if (!hasContent) return null;

    return (
      <div {...getHelperWrapperProps()}>
        {shouldShowError ? (
          <div {...getErrorMessageProps()}>{errorMessage}</div>
        ) : (
          <div {...getDescriptionProps()}>{description}</div>
        )}
      </div>
    );
  }, [
    isInvalid,
    errorMessage,
    description,
    getHelperWrapperProps,
    getErrorMessageProps,
    getDescriptionProps,
  ]);

  const innerWrapper = (
    <div {...getInnerWrapperProps()}>
      {startContent}
      <input {...getInputProps()} />
      {end}
    </div>
  );

  return (
    // @ts-ignore
    <Component {...getBaseProps()}>
      {shouldLabelBeOutside ? labelContent : null}
      <div {...getInputWrapperProps()}>
        {!shouldLabelBeOutside ? labelContent : null}
        {innerWrapper}
      </div>
      {helperWrapper}
    </Component>
  );
});

Input.displayName = "Input";
