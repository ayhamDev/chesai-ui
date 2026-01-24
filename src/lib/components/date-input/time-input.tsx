"use client";

import type { TimeValue } from "@react-types/datepicker"; // FIX: Changed import path
import React, { forwardRef } from "react";
import { DateInputField } from "./date-input-field";
import { DateInputGroup } from "./date-input-group";
import { useTimeInput, type UseTimeInputProps } from "./use-time-input";

export interface TimeInputProps<
  T extends TimeValue,
> extends UseTimeInputProps<T> {}

const TimeInput = forwardRef(function TimeInput<T extends TimeValue>(
  props: TimeInputProps<T>,
  ref: React.Ref<HTMLDivElement>,
) {
  const {
    state,
    slots,
    classNames,
    getBaseGroupProps,
    getInputProps,
    getFieldProps,
  } = useTimeInput({ ...props, ref });

  return (
    // FIX: Cast props to 'any' to resolve complex type incompatibility
    <DateInputGroup {...(getBaseGroupProps() as any)}>
      <DateInputField
        state={state}
        inputProps={getInputProps()}
        // @ts-ignore - passing styling props down if needed
        slots={slots}
        classNames={classNames}
        {...getFieldProps()}
      />
    </DateInputGroup>
  );
});

// Helper to cast the forwardRef generic correctly for consumers
const TypedTimeInput = TimeInput as <T extends TimeValue>(
  props: TimeInputProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;

export { TypedTimeInput as TimeInput };
