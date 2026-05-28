// src/lib/components/lexical-editor/index.tsx
"use client";

import React, { useEffect } from "react";
import { clsx } from "clsx";
import { cva, type VariantProps } from "class-variance-authority";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin"; // <-- ADDED IMPORT

import {
  TRANSFORMERS,
  $convertToMarkdownString,
  $convertFromMarkdownString,
} from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { CodeHighlightNode, CodeNode } from "@lexical/code";

import { lexicalTheme } from "./theme";
import { ToolbarPlugin } from "./plugins/ToolbarPlugin";
import { Typography } from "../typography";
import { CodeBlockNode } from "./nodes/CodeBlockNode";

const lexicalEditorVariants = cva(
  "flex flex-col relative w-full overflow-hidden border transition-all duration-300 outline-none focus-within:ring-2 focus-within:ring-primary/20",
  {
    variants: {
      variant: {
        primary: "bg-surface-container-low border-outline-variant",
        secondary: "bg-surface-container-high border-outline-variant",
        surface: "bg-surface border-outline-variant/50",
        ghost: "bg-transparent border-transparent",
      },
      shape: {
        full: "rounded-3xl",
        minimal: "rounded-xl",
        sharp: "rounded-none",
      },
      shadow: {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
      },
      isInvalid: {
        true: "",
        false: "",
      },
      disabled: {
        true: "opacity-50 pointer-events-none cursor-not-allowed",
        false: "",
      },
    },
    compoundVariants: [
      // Error states
      {
        variant: ["primary", "secondary", "surface"],
        isInvalid: true,
        className:
          "bg-error-container/20 !border-error text-error ring-inset ring-2 ring-error/20",
      },
      {
        variant: "ghost",
        isInvalid: true,
        className: "!border-error text-error",
      },
    ],
    defaultVariants: {
      variant: "primary",
      shape: "minimal",
      shadow: "none",
      isInvalid: false,
      disabled: false,
    },
  },
);

export interface LexicalEditorProps extends VariantProps<
  typeof lexicalEditorVariants
> {
  /** Placeholder text shown when empty */
  placeholder?: string;
  /** Markdown string to initialize the editor with */
  markdown?: string;
  /** Callback fired on every change, passing back pure markdown */
  onChange?: (markdown: string) => void;
  /** Puts the editor in read-only mode */
  readOnly?: boolean;
  className?: string;
  label?: string;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
}

function MarkdownBridgePlugin({
  initialMarkdown,
  onChange,
}: {
  initialMarkdown?: string;
  onChange?: (markdown: string) => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialMarkdown) {
      editor.update(() => {
        $convertFromMarkdownString(initialMarkdown, TRANSFORMERS);
      });
    }
  }, [editor, initialMarkdown]);

  return onChange ? (
    <OnChangePlugin
      onChange={(editorState) => {
        editorState.read(() => {
          const markdownString = $convertToMarkdownString(TRANSFORMERS);
          onChange(markdownString);
        });
      }}
    />
  ) : null;
}

export const LexicalEditor = ({
  placeholder = "Start writing...",
  markdown,
  onChange,
  readOnly = false,
  className,
  variant,
  shape = "minimal",
  shadow,
  isInvalid,
  disabled,
  label,
  description,
  errorMessage,
}: LexicalEditorProps) => {
  const editorConfig = {
    namespace: "ChesaiLexicalEditor",
    theme: lexicalTheme,
    editable: !readOnly && !disabled,
    onError(error: Error) {
      console.error(error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      AutoLinkNode,
      LinkNode,
      CodeBlockNode, // Registered custom component node
    ],
  };

  const labelContent = label ? (
    <span
      className={clsx(
        "ml-1 mb-1.5 text-sm font-semibold block transition-colors",
        isInvalid ? "text-error" : "text-on-surface-variant/70",
      )}
    >
      {label}
    </span>
  ) : null;

  const helperWrapper = (description || (isInvalid && errorMessage)) && (
    <div className="p-1 relative flex flex-col gap-1.5 mt-1">
      {isInvalid && errorMessage ? (
        <div className="text-xs text-error">{errorMessage}</div>
      ) : (
        <div className="text-xs text-on-surface-variant">{description}</div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col w-full relative">
      {labelContent}

      <div
        className={clsx(
          lexicalEditorVariants({
            variant,
            shape,
            shadow,
            isInvalid,
            disabled,
          }),
          className,
        )}
      >
        <LexicalComposer initialConfig={editorConfig}>
          {!readOnly && !disabled && <ToolbarPlugin shape={shape || undefined} />}

          <div className="relative flex-1">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className={clsx(
                    "min-h-[250px] outline-none p-5 w-full h-full text-on-surface caret-primary",
                    readOnly && "p-0 min-h-0",
                  )}
                />
              }
              placeholder={
                <div
                  className={clsx(
                    "absolute top-5 left-5 text-on-surface-variant/50 pointer-events-none select-none",
                    readOnly && "hidden",
                  )}
                >
                  {placeholder}
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
            <TabIndentationPlugin /> {/* <-- ADDED PLUGIN */}
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <MarkdownBridgePlugin
              initialMarkdown={markdown}
              onChange={onChange}
            />
          </div>
        </LexicalComposer>
      </div>

      {helperWrapper}
    </div>
  );
};

LexicalEditor.displayName = "LexicalEditor";
