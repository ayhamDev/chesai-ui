"use client";

import { clsx } from "clsx";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { Typography } from "../typography";
import { IconButton } from "../icon-button";

export interface DropzoneProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onDrop"
> {
  onDrop: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  disabled?: boolean;
  label?: string;
  description?: string;
}

export const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  (
    {
      className,
      onDrop,
      accept,
      multiple = true,
      maxSize,
      disabled = false,
      label = "Click or drag files here",
      description = "SVG, PNG, JPG or GIF (max. 5MB)",
      ...props
    },
    ref,
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
      },
      [disabled],
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const processFiles = (files: File[]) => {
      setError(null);
      let validFiles = files;

      if (!multiple && files.length > 1) {
        validFiles = [files[0]];
      }

      if (maxSize) {
        const oversized = validFiles.find((f) => f.size > maxSize);
        if (oversized) {
          setError(`File ${oversized.name} exceeds the maximum size limit.`);
          return;
        }
      }

      setSelectedFiles((prev) =>
        multiple ? [...prev, ...validFiles] : validFiles,
      );
      onDrop(validFiles);
    };

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) processFiles(files);
      },
      [disabled, multiple, maxSize, onDrop],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) processFiles(files);
      // Reset input so the same file can be selected again if removed
      if (inputRef.current) inputRef.current.value = "";
    };

    const removeFile = (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
      <div className="flex flex-col gap-2 w-full">
        <div
          ref={ref}
          onClick={() => !disabled && inputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={clsx(
            "relative flex flex-col items-center justify-center w-full min-h-[160px] p-6 border-2 border-dashed rounded-2xl transition-all duration-200",
            disabled
              ? "opacity-50 cursor-not-allowed bg-surface-container"
              : "cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-outline-variant hover:border-primary/50 hover:bg-surface-container-highest",
            error && "border-error bg-error-container/20",
            className,
          )}
          {...props}
        >
          <input
            type="file"
            ref={inputRef}
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            disabled={disabled}
          />

          <div
            className={clsx(
              "p-4 rounded-full mb-3 transition-colors",
              isDragging
                ? "bg-primary/20 text-primary"
                : "bg-surface-container-highest text-on-surface-variant",
            )}
          >
            <UploadCloud className="h-8 w-8" />
          </div>

          <Typography
            variant="label-large"
            className="font-bold text-center mb-1"
          >
            {label}
          </Typography>
          <Typography
            variant="body-small"
            className="text-on-surface-variant text-center max-w-xs"
          >
            {description}
          </Typography>
        </div>

        {error && (
          <Typography variant="body-small" className="text-error mt-1">
            {error}
          </Typography>
        )}

        {selectedFiles.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-surface-container-low border border-outline-variant rounded-xl"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileIcon className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={(e) => removeFile(index, e)}
                >
                  <X className="h-4 w-4" />
                </IconButton>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);
Dropzone.displayName = "Dropzone";
