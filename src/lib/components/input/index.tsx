"use client";

import { X } from "lucide-react";
import React, { forwardRef, useMemo } from "react";
import { type UseInputProps, useInput } from "./use-input";

export { inputWrapperVariants } from "./input-styles";

export interface InputProps extends UseInputProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    Component,
    label,
    description,
    isClearable,
    startContent,
    endContent,
    shouldLabelBeOutside,
    errorMessage,
    isInvalid,
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

  const end = useMemo(() => {
    if (isClearable) {
      return (
        <button {...getClearButtonProps()}>
          {endContent || <X className="h-4 w-4" />}
        </button>
      );
    }
    return endContent;
  }, [isClearable, getClearButtonProps, endContent]);

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
