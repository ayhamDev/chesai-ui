// src/lib/components/date-input/duration-input-field.tsx
"use client";

import React, { forwardRef } from "react";
import { DurationInputSegment } from "./duration-input-segment";
import type { DurationFieldState } from "./use-duration-input";

export interface DurationInputFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  state: DurationFieldState;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}

export const DurationInputField = forwardRef<
  HTMLDivElement,
  DurationInputFieldProps
>((props, ref) => {
  const { state, inputProps, className, style, ...otherProps } = props;

  return (
    <div ref={ref} className={className} style={style} {...otherProps}>
      {state.segments.map((segment, i) => (
        <DurationInputSegment key={i} segment={segment} state={state} />
      ))}
      <input {...inputProps} />
    </div>
  );
});

DurationInputField.displayName = "DurationInputField";
