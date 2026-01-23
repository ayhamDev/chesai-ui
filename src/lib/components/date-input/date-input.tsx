// src/lib/components/date-input/date-input.tsx
"use client";

import type { DateValue } from "@internationalized/date";
import React, { forwardRef } from "react";
import { DateInputField } from "./date-input-field";
import { DateInputGroup } from "./date-input-group";
import { useDateInput, type UseDateInputProps } from "./use-date-input";

export interface DateInputProps<
  T extends DateValue,
> extends UseDateInputProps<T> {}

const DateInput = forwardRef(function DateInput<T extends DateValue>(
  props: DateInputProps<T>,
  ref: React.Ref<HTMLDivElement>,
) {
  const {
    state,
    slots,
    classNames,
    getBaseGroupProps,
    getInputProps,
    getFieldProps,
  } = useDateInput({ ...props, ref });

  return (
    <DateInputGroup {...getBaseGroupProps()}>
      <DateInputField
        state={state}
        inputProps={getInputProps()}
        // @ts-ignore
        slots={slots}
        classNames={classNames}
        {...getFieldProps()}
      />
    </DateInputGroup>
  );
});

const TypedDateInput = DateInput as <T extends DateValue>(
  props: DateInputProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;

export { TypedDateInput as DateInput };
