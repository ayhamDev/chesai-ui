"use client";

import { clsx } from "clsx";
import { UploadCloud, File as FileIcon, X, DownloadCloud } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { Typography } from "../typography";
import { IconButton } from "../icon-button";
import { AnimatePresence, motion } from "framer-motion";

export interface DropzoneFileItem {
  id: string;
  name: string;
  size: number;
}

// --- EXISTING DROPZONE ---
export interface DropzoneProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onDrop"
> {
  onDrop: (files: File[]) => void | Promise<void>;
  files?: DropzoneFileItem[];
  onRemove?: (
    file: DropzoneFileItem,
    index: number,
  ) => void | Promise<void>;
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
      files,
      onRemove,
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
    const [selectedFiles, setSelectedFiles] = useState<DropzoneFileItem[]>([]);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const nextFileId = useRef(0);

    const displayedFiles = files ?? selectedFiles;

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

    const processFiles = useCallback(
      (incomingFiles: File[]) => {
        setError(null);
        let validFiles = incomingFiles;

        if (!multiple && incomingFiles.length > 1) {
          validFiles = [incomingFiles[0]];
        }

        if (maxSize) {
          const oversized = validFiles.find((f) => f.size > maxSize);
          if (oversized) {
            setError(`File ${oversized.name} exceeds the maximum size limit.`);
            return;
          }
        }

        if (files === undefined) {
          const fileItems = validFiles.map((file) => ({
            id: `${file.name}-${file.lastModified}-${nextFileId.current++}`,
            name: file.name,
            size: file.size,
          }));

          setSelectedFiles((prev) =>
            multiple ? [...prev, ...fileItems] : fileItems,
          );
        }
        onDrop(validFiles);
      },
      [files, maxSize, multiple, onDrop],
    );

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) processFiles(files);
      },
      [disabled, processFiles],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) processFiles(files);
      if (inputRef.current) inputRef.current.value = "";
    };

    const removeFile = async (
      file: DropzoneFileItem,
      index: number,
      event: React.MouseEvent,
    ) => {
      event.stopPropagation();

      try {
        setError(null);
        setRemovingId(file.id);

        await onRemove?.(file, index);

        if (files === undefined) {
          setSelectedFiles((current) =>
            current.filter((_, currentIndex) => currentIndex !== index),
          );
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "The file could not be removed.",
        );
      } finally {
        setRemovingId(null);
      }
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

        {displayedFiles.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            {displayedFiles.map((file, index) => (
              <div
                key={file.id}
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
                  disabled={disabled || removingId === file.id}
                  aria-label={`Remove ${file.name}`}
                  onClick={(event) => void removeFile(file, index, event)}
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

// --- VIRTUAL DROPZONE ---

export interface VirtualDropzoneProps extends React.HTMLAttributes<HTMLDivElement> {
  onDropFiles: (files: File[]) => void;
  disabled?: boolean;
  overlayLabel?: string;
  overlayIcon?: React.ReactNode;
}

export const VirtualDropzone = React.forwardRef<
  HTMLDivElement,
  VirtualDropzoneProps
>(
  (
    {
      children,
      onDropFiles,
      disabled = false,
      overlayLabel = "Drop files here to upload",
      overlayIcon = <DownloadCloud className="w-12 h-12 mb-4 text-primary" />,
      className,
      ...props
    },
    ref,
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    // Counter prevents flicker when dragging over child elements
    const dragCounter = useRef(0);

    const handleDragEnter = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;

        // Only trigger if files are being dragged (not text/links)
        if (e.dataTransfer.types.includes("Files")) {
          dragCounter.current += 1;
          if (dragCounter.current === 1) {
            setIsDragging(true);
          }
        }
      },
      [disabled],
    );

    const handleDragLeave = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;

        dragCounter.current -= 1;
        if (dragCounter.current === 0) {
          setIsDragging(false);
        }
      },
      [disabled],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setIsDragging(false);

        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
          onDropFiles(files);
        }
      },
      [disabled, onDropFiles],
    );

    return (
      <div
        ref={ref}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={clsx("relative h-full w-full", className)}
        {...props}
      >
        {children}

        {/* DRAG OVERLAY */}
        <AnimatePresence>
          {isDragging && !disabled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-50 p-4 pointer-events-none"
            >
              <div className="w-full h-full rounded-2xl border-4 border-dashed border-primary bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center shadow-2xl">
                {overlayIcon}
                <Typography
                  variant="title-large"
                  className="font-bold text-primary"
                >
                  {overlayLabel}
                </Typography>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);
VirtualDropzone.displayName = "VirtualDropzone";
