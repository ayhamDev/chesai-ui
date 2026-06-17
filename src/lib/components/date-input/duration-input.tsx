// src/lib/components/date-input/duration-input.tsx
"use client";

import React, { forwardRef } from "react";
import { DurationInputField } from "./duration-input-field";
import { DateInputGroup } from "./date-input-group";
import {
  useDurationInput,
  type UseDurationInputProps,
} from "./use-duration-input";

export interface DurationInputProps extends UseDurationInputProps {}

export const DurationInput = forwardRef<HTMLDivElement, DurationInputProps>(
  (props, ref) => {
    const {
      state,
      slots,
      classNames,
      getBaseGroupProps,
      getInputProps,
      getFieldProps,
    } = useDurationInput({ ...props, ref });

    return (
      <DateInputGroup {...(getBaseGroupProps() as any)}>
        <DurationInputField
          state={state}
          inputProps={getInputProps()}
          // @ts-ignore
          slots={slots}
          classNames={classNames}
          {...getFieldProps()}
        />
      </DateInputGroup>
    );
  },
);

DurationInput.displayName = "DurationInput";
