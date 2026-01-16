"use client";

import { X } from "lucide-react";
import React, { forwardRef, useMemo } from "react";
import { NumberInputStepper } from "./number-input-stepper";
import { type UseNumberInputProps, useNumberInput } from "./use-number-input";

export interface NumberInputProps extends UseNumberInputProps {}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
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
      hideStepper,
      getBaseProps,
      getLabelProps,
      getInputProps,
      getInnerWrapperProps,
      getInputWrapperProps,
      getHelperWrapperProps,
      getDescriptionProps,
      getErrorMessageProps,
      getClearButtonProps,
      getStepperWrapperProps,
      getStepperButtonProps,
    } = useNumberInput({ ...props, ref });

    const labelContent = label ? (
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

    // Extract input props to fix specific type issues
    const { inputMode, ...inputPropsRest } = getInputProps();

    const innerWrapper = (
      <div {...getInnerWrapperProps()}>
        {startContent}
        <input
          {...inputPropsRest}
          // Fix: Explicitly cast inputMode to specific literal types accepted by React
          inputMode={inputMode as "decimal" | "numeric"}
        />
        {clearButton}
        {endContent}
        {!hideStepper && (
          <div {...getStepperWrapperProps()}>
            <NumberInputStepper
              {...getStepperButtonProps("up")}
              direction="up"
            />
            <NumberInputStepper
              {...getStepperButtonProps("down")}
              direction="down"
            />
          </div>
        )}
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

NumberInput.displayName = "NumberInput";
