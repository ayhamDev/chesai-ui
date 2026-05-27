// src/lib/components/full-calendar/print-preview-dialog.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../button";
import { DatePicker } from "../date-picker/date-picker";
import { Dialog, DialogContent } from "../dialog";
import { Select } from "../select";
import { Checkbox } from "../checkbox";
import { Typography } from "../typography";
import { useFullCalendar } from "./calendar-context";
import { PrintPagesLayout } from "./index";

export const PrintPreviewDialog = () => {
  const {
    isPrintPreviewOpen,
    setPrintPreviewOpen,
    printSettings,
    setPrintSettings,
  } = useFullCalendar();

  const handlePrint = useCallback(() => {
    setPrintPreviewOpen(false);
    setTimeout(() => {
      window.print();
    }, 400);
  }, [setPrintPreviewOpen]);

  const isLandscape =
    printSettings.orientation === "landscape" ||
    printSettings.orientation === "auto";

  const printWidth = isLandscape ? 1056 : 816;
  const printHeight = isLandscape ? 816 : 1056;

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
    <Dialog open={isPrintPreviewOpen} onOpenChange={setPrintPreviewOpen}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="flex flex-col md:flex-row gap-0 p-0 overflow-hidden max-w-6xl! w-[95vw] h-[85vh] bg-surface-container"
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
                label="Font size"
                variant="filled"
                size="sm"
                value={printSettings.fontSize}
                onValueChange={(v) =>
                  setPrintSettings((s) => ({ ...s, fontSize: v as any }))
                }
                items={[
                  { value: "normal", label: "Normal" },
                  { value: "small", label: "Small" },
                  { value: "smallest", label: "Smallest" },
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

              <div className="flex flex-col gap-3 mt-2">
                <Checkbox
                  label="Show weekends"
                  checked={printSettings.showWeekends}
                  onChange={(e) =>
                    setPrintSettings((s) => ({
                      ...s,
                      showWeekends: e.target.checked,
                    }))
                  }
                />
                <Checkbox
                  label="Show events you have declined"
                  checked={printSettings.showDeclined}
                  onChange={(e) =>
                    setPrintSettings((s) => ({
                      ...s,
                      showDeclined: e.target.checked,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="mt-auto p-4 flex items-center justify-end gap-3 border-t border-outline-variant/30 bg-surface-container-high shrink-0 z-20">
            <Button variant="ghost" onClick={() => setPrintPreviewOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePrint}
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
