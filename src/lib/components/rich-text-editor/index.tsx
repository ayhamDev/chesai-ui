"use client";

import React, { useEffect, useRef } from "react";
import EditorJS, {
  type OutputData,
  type EditorConfig,
} from "@editorjs/editorjs";
// @ts-ignore
import Header from "@editorjs/header";
// @ts-ignore
import List from "@editorjs/list";
import { clsx } from "clsx";

export interface RichTextEditorProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  /**
   * Minimum height of the editor area in pixels.
   * @default 300
   */
  minHeight?: number;
}

export const RichTextEditor = ({
  data,
  onChange,
  placeholder,
  readOnly = false,
  className,
  minHeight = 300,
}: RichTextEditorProps) => {
  // Generate a stable unique ID so we can render multiple editors if needed
  const holderId = useRef(`editorjs-${Math.random().toString(36).slice(2, 9)}`);
  const editorInstance = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!editorInstance.current) {
      const editor = new EditorJS({
        holder: holderId.current,
        data: data,
        readOnly,
        placeholder: placeholder || "Start writing...",
        minHeight: minHeight,
        // Using the tools matching the styling classes we wrote
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              placeholder: "Heading",
              levels: [1, 2, 3],
              defaultLevel: 2,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: "unordered",
            },
          },
        },
        onChange: async (api, _event) => {
          const content = await api.saver.save();
          onChange?.(content);
        },
      });

      editorInstance.current = editor;
    }

    return () => {
      if (
        editorInstance.current &&
        typeof editorInstance.current.destroy === "function"
      ) {
        try {
          editorInstance.current.destroy();
        } catch (e) {
          // console.warn("Editor cleanup warning", e);
        }
        editorInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle readOnly updates dynamically
  useEffect(() => {
    if (
      editorInstance.current &&
      typeof editorInstance.current.readOnly !== "undefined"
    ) {
      editorInstance.current.readOnly.toggle(readOnly);
    }
  }, [readOnly]);

  return (
    <div className={clsx("w-full relative", className)}>
      {/* 
        The 'chesai-editor' class triggers all the CSS overrides 
        defined in editor-styles.css
      */}
      <div
        id={holderId.current}
        className="chesai-editor w-full"
        style={{ minHeight }}
      />
    </div>
  );
};

RichTextEditor.displayName = "RichTextEditor";
