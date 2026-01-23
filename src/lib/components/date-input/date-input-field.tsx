"use client";

import type { DateFieldState } from "@react-stately/datepicker";
import React, { forwardRef } from "react";
import { DateInputSegment } from "./date-input-segment";

export interface DateInputFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  state: DateFieldState;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}

export const DateInputField = forwardRef<HTMLDivElement, DateInputFieldProps>(
  (props, ref) => {
    const { state, inputProps, className, style, ...otherProps } = props;

    return (
      <div ref={ref} className={className} style={style} {...otherProps}>
        {state.segments.map((segment, i) => (
          <DateInputSegment key={i} segment={segment} state={state} />
        ))}
        {/* Hidden input for form submission */}
        <input {...inputProps} />
      </div>
    );
  },
);

DateInputField.displayName = "DateInputField";
