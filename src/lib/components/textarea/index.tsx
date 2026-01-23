"use client";

import { X } from "lucide-react";
import React, { forwardRef, useMemo } from "react";
import { type UseTextareaProps, useTextarea } from "./use-textarea";

export interface TextareaProps extends UseTextareaProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => {
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
    } = useTextarea({ ...props, ref });

    const labelContent = label ? (
      // biome-ignore lint/a11y/noLabelWithoutControl: <none>
      <label {...getLabelProps()}>{label}</label>
    ) : null;

    const clearButton = useMemo(() => {
      if (isClearable) {
        return (
          <button {...getClearButtonProps()}>
            <X className="h-4 w-4" />
          </button>
        );
      }
      return null;
    }, [isClearable, getClearButtonProps]);

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
        {/* Fix: Spread cast to allow textarea attributes */}
        <textarea {...(getInputProps() as any)} />
        {endContent}
        {clearButton}
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
  }
);

Textarea.displayName = "Textarea";
