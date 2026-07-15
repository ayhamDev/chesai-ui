"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import { useLayout } from "../../context/layout-context";
import { Button } from "../button";
import { useFullCalendar } from "./calendar-context";

export const RecurrenceScopeDialog = () => {
  const {
    recurrenceScopeRequest,
    resolveRecurrenceScope,
  } = useFullCalendar();
  const { isRtl } = useLayout();

  useEffect(() => {
    if (!recurrenceScopeRequest) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") resolveRecurrenceScope(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [recurrenceScopeRequest, resolveRecurrenceScope]);

  if (!recurrenceScopeRequest || typeof document === "undefined") return null;

  const isDelete = recurrenceScopeRequest?.action === "delete";

  return createPortal(
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) resolveRecurrenceScope(null);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="recurrence-scope-title"
        aria-describedby="recurrence-scope-description"
        className="w-full max-w-md rounded-[28px] border border-outline-variant/40 bg-surface-container-high p-6 text-on-surface shadow-2xl"
      >
        <div className="flex flex-col gap-2">
          <h2 id="recurrence-scope-title" className="text-xl font-semibold">
            {isDelete ? "Delete recurring event" : "Update recurring event"}
          </h2>
          <p
            id="recurrence-scope-description"
            className="text-sm text-on-surface-variant"
          >
            {isDelete
              ? "Choose whether to delete only this occurrence or the entire recurring series."
              : "Choose whether to update only this occurrence or the entire recurring series."}
          </p>
        </div>

        {recurrenceScopeRequest?.singleDisabled && (
          <p className="mt-4 text-sm text-on-surface-variant">
            Recurrence rule changes can only be applied to all events.
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button
            variant="ghost"
            autoFocus
            onClick={() => resolveRecurrenceScope(null)}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            disabled={recurrenceScopeRequest?.singleDisabled}
            onClick={() => resolveRecurrenceScope("single")}
          >
            This event
          </Button>
          <Button
            variant={isDelete ? "destructive" : "primary"}
            onClick={() => resolveRecurrenceScope("all")}
          >
            All events
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
