"use client";

import { useDateSegment } from "@react-aria/datepicker";
import {
  type DateFieldState,
  type DateSegment,
} from "@react-stately/datepicker";
import { clsx } from "clsx";
import { useRef } from "react";
import { dateInputSlots } from "./date-input-styles";

export interface DateInputSegmentProps extends React.HTMLAttributes<HTMLDivElement> {
  state: DateFieldState;
  segment: DateSegment;
  className?: string;
}

export const DateInputSegment = ({
  state,
  segment,
  className,
  ...props
}: DateInputSegmentProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Hook to handle keyboard navigation, focus, and aria attributes
  const { segmentProps } = useDateSegment(segment, state, ref);

  return (
    <div
      {...segmentProps}
      ref={ref}
      className={clsx(dateInputSlots.segment, className)}
      // Data attributes for styling
      data-editable={segment.isEditable}
      data-placeholder={segment.isPlaceholder}
      data-invalid={state.isInvalid}
      data-type={segment.type}
      style={{
        ...segmentProps.style,
        minWidth:
          segment.maxValue != null
            ? String(segment.maxValue).length + "ch"
            : undefined,
      }}
      {...props}
    >
      {segment.text}
    </div>
  );
};

DateInputSegment.displayName = "DateInputSegment";
