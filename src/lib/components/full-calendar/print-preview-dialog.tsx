// src/lib/components/full-calendar/print-preview-dialog.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { DatePicker } from "../date-picker/date-picker";
import { Dialog, DialogContent } from "../dialog";
import { Select } from "../select";
import { Typography } from "../typography";
import { useFullCalendar } from "./calendar-context";
import { PrintPagesLayout } from "./index";
import {
  filterDaysWithEvents,
  getDayDatesInRange,
  LETTER_PAGE_PIXELS,
  resolvePrintOrientation,
} from "./print-layout";

export const PrintPreviewDialog = () => {
  const {
    isPrintPreviewOpen,
    setPrintPreviewOpen,
    events,
    printSettings,
    setPrintSettings,
  } = useFullCalendar();

  const handlePrint = useCallback(() => {
    setPrintPreviewOpen(false);
    setTimeout(() => {
      window.print();
    }, 400);
  }, [setPrintPreviewOpen]);

  const resolvedOrientation = resolvePrintOrientation(
    printSettings.orientation,
  );
  const { width: printWidth, height: printHeight } =
    LETTER_PAGE_PIXELS[resolvedOrientation];
  const isDayView = printSettings.view === "day";
  const hasPrintableDays = useMemo(
    () =>
      !isDayView ||
      !printSettings.onlyDaysWithEvents ||
      filterDaysWithEvents(
        getDayDatesInRange(printSettings.rangeStart, printSettings.rangeEnd),
        events,
      ).length > 0,
    [
      events,
      isDayView,
      printSettings.onlyDaysWithEvents,
      printSettings.rangeEnd,
      printSettings.rangeStart,
    ],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Calculates exact zoom scalar to fit widths properly but let height overflow
  useEffect(() => {
    if (!isPrintPreviewOpen) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        // Allows 1 perfect page layout on-screen, but supports infinite scrolling
        const targetScale =
          Math.min(width / printWidth, height / printHeight) * 0.95;
        setScale(targetScale);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [printWidth, printHeight, isPrintPreviewOpen]);

  return (
    <Dialog
      open={isPrintPreviewOpen}
      onOpenChange={setPrintPreviewOpen}
      isLocked={true}
    >
      <DialogContent
        className="flex flex-col md:flex-row gap-0 p-0 overflow-hidden max-w-full w-[95vw] h-[85vh] bg-surface-container"
        shape="minimal"
      >
        <div className="w-[400px] flex-shrink-0 bg-surface-container-high border-r border-outline-variant/30 flex flex-col h-full z-10 shadow-lg relative">
          <div className="p-6 pb-2 overflow-y-auto">
            <Typography variant="title-large" className="font-medium mb-6">
              Print preview
            </Typography>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <Typography variant="label-small" className="opacity-70">
                  Print range
                </Typography>
                <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center gap-2">
                  <DatePicker
                    variant="docked"
                    inputVariant="filled"
                    size="sm"
                    value={printSettings.rangeStart}
                    onChange={(d) =>
                      d && setPrintSettings((s) => ({ ...s, rangeStart: d }))
                    }
                  />
                  <span className="text-sm opacity-60 hidden 2xl:block">
                    to
                  </span>
                  <DatePicker
                    variant="docked"
                    inputVariant="filled"
                    size="sm"
                    value={printSettings.rangeEnd}
                    onChange={(d) =>
                      d && setPrintSettings((s) => ({ ...s, rangeEnd: d }))
                    }
                  />
                </div>
              </div>

              <Select
                labelPlacement="outside"
                label="View"
                variant="filled"
                size="sm"
                value={printSettings.view}
                onValueChange={(v) =>
                  setPrintSettings((s) => ({ ...s, view: v as any }))
                }
                items={[
                  { value: "auto", label: "Auto" },
                  { value: "day", label: "Day" },
                  { value: "week", label: "Week" },
                  { value: "month", label: "Month" },
                  { value: "year", label: "Year" },
                ]}
              />

              <Select
                labelPlacement="outside"
                label="Orientation"
                variant="filled"
                size="sm"
                value={printSettings.orientation}
                onValueChange={(v) =>
                  setPrintSettings((s) => ({ ...s, orientation: v as any }))
                }
                items={[
                  { value: "auto", label: "Auto" },
                  { value: "portrait", label: "Portrait" },
                  { value: "landscape", label: "Landscape" },
                ]}
              />

              <Select
                labelPlacement="outside"
                label="Color & style"
                variant="filled"
                size="sm"
                value={printSettings.colorStyle}
                onValueChange={(v) =>
                  setPrintSettings((s) => ({ ...s, colorStyle: v as any }))
                }
                items={[
                  { value: "full", label: "Full color" },
                  { value: "bw", label: "Black and white" },
                ]}
              />

            </div>
          </div>

          <div className="mt-auto px-6 py-4 border-t border-outline-variant/30 bg-surface-container-high shrink-0">
            <Typography
              variant="label-small"
              className="mb-3 text-on-surface-variant opacity-70"
            >
              Options
            </Typography>
            <div className="flex flex-col gap-1 px-1">
              <Checkbox
                checked={printSettings.onlyDaysWithEvents}
                disabled={!isDayView}
                label="Only days with events"
                onChange={(event) =>
                  setPrintSettings((settings) => ({
                    ...settings,
                    onlyDaysWithEvents: event.target.checked,
                  }))
                }
              />
              {!isDayView && (
                <Typography
                  variant="label-small"
                  className="ms-9 text-on-surface-variant opacity-70"
                >
                  Available in Day view
                </Typography>
              )}
              {!hasPrintableDays && (
                <Typography
                  variant="label-small"
                  className="ms-9 text-error"
                >
                  No event days in this range
                </Typography>
              )}
            </div>
          </div>

          <div className="p-4 flex items-center justify-end gap-3 border-t border-outline-variant/30 bg-surface-container-high shrink-0 z-20">
            <Button variant="ghost" onClick={() => setPrintPreviewOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePrint}
              disabled={!hasPrintableDays}
              className="px-6 rounded-full font-bold"
            >
              Print
            </Button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex-1 bg-surface-container-low flex flex-col p-4 md:p-8 overflow-y-auto overflow-x-hidden relative"
        >
          {/* Strict Light Mode Enforcement for Previews */}
          <div
            className="w-full flex justify-center pb-12"
            style={
              {
                "--md-sys-color-on-surface": "#000000",
                "--md-sys-color-on-surface-variant": "#4b5563",
                "--md-sys-color-surface": "#ffffff",
                "--md-sys-color-surface-container": "#ffffff",
                "--md-sys-color-surface-container-low": "#ffffff",
                "--md-sys-color-surface-container-high": "#f3f4f6",
                "--md-sys-color-outline-variant": "#e5e7eb",
              } as React.CSSProperties
            }
          >
            <PrintPagesLayout
              isPreview={true}
              printWidth={printWidth}
              printHeight={printHeight}
              scale={scale}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
