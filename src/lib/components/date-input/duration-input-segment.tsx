"use client";

import { clsx } from "clsx";
import React, { useRef, useState } from "react";
import { dateInputSlots } from "./date-input-styles";
import type { DurationSegment, DurationFieldState } from "./use-duration-input";

export interface DurationInputSegmentProps extends React.HTMLAttributes<HTMLDivElement> {
  state: DurationFieldState;
  segment: DurationSegment;
  className?: string;
}

export const DurationInputSegment = ({
  state,
  segment,
  className,
  ...props
}: DurationInputSegmentProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [typedBuffer, setTypedBuffer] = useState("");

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    setTypedBuffer("");
    if (props.onBlur) props.onBlur(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!segment.isEditable || segment.type === "literal") return;
    const segmentType = segment.type as "hours" | "minutes" | "seconds";

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const focusable = Array.from(
        e.currentTarget.parentElement?.querySelectorAll(
          '[data-editable="true"]',
        ) || [],
      ) as HTMLDivElement[];
      const index = focusable.indexOf(e.currentTarget);
      if (index > -1 && index < focusable.length - 1) {
        focusable[index + 1].focus();
      }
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const focusable = Array.from(
        e.currentTarget.parentElement?.querySelectorAll(
          '[data-editable="true"]',
        ) || [],
      ) as HTMLDivElement[];
      const index = focusable.indexOf(e.currentTarget);
      if (index > 0) {
        focusable[index - 1].focus();
      }
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setTypedBuffer("");
      const currentVal = segment.value;
      let newVal = currentVal === null ? segment.minValue : currentVal + 1;
      if (newVal > segment.maxValue) {
        newVal = segment.minValue;
      }
      state.setSegmentValue(segmentType, newVal);
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setTypedBuffer("");
      const currentVal = segment.value;
      let newVal = currentVal === null ? segment.maxValue : currentVal - 1;
      if (newVal < segment.minValue) {
        newVal = segment.maxValue;
      }
      state.setSegmentValue(segmentType, newVal);
    }

    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      setTypedBuffer("");
      state.setSegmentValue(segmentType, null);
    }

    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const digit = e.key;
      const nextBuffer = typedBuffer + digit;
      const parsed = parseInt(nextBuffer, 10);

      if (parsed <= segment.maxValue) {
        setTypedBuffer(nextBuffer);
        state.setSegmentValue(segmentType, parsed);

        // Auto-advance focus if the maximum length for a 2-digit number is reached
        if (nextBuffer.length >= 2 || parsed * 10 > segment.maxValue) {
          setTimeout(() => {
            if (!ref.current) return;
            const focusable = Array.from(
              ref.current.parentElement?.querySelectorAll(
                '[data-editable="true"]',
              ) || [],
            ) as HTMLDivElement[];
            const index = focusable.indexOf(ref.current);
            if (index > -1 && index < focusable.length - 1) {
              focusable[index + 1].focus();
            }
          }, 50);
        }
      } else {
        const singleParsed = parseInt(digit, 10);
        if (singleParsed <= segment.maxValue) {
          setTypedBuffer(digit);
          state.setSegmentValue(segmentType, singleParsed);
        }
      }
    }
  };

  const isLiteral = segment.type === "literal";

  return (
    <div
      ref={ref}
      tabIndex={isLiteral ? undefined : 0}
      className={clsx(dateInputSlots.segment, className, {
        "pointer-events-none px-0.5": isLiteral,
      })}
      data-editable={segment.isEditable}
      data-placeholder={segment.isPlaceholder}
      data-invalid={state.isInvalid}
      data-type={segment.type}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      style={{
        minWidth: !isLiteral ? "2ch" : undefined,
      }}
      {...props}
    >
      {segment.text}
    </div>
  );
};

DurationInputSegment.displayName = "DurationInputSegment";
