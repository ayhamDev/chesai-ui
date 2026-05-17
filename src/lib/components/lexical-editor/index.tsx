// src/lib/components/lexical-editor/index.tsx
"use client";

import React, { useEffect } from "react";
import { clsx } from "clsx";

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

import {
  TRANSFORMERS,
  $convertToMarkdownString,
  $convertFromMarkdownString,
} from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { CodeHighlightNode, CodeNode } from "@lexical/code";

import { lexicalTheme } from "./theme";
import { ToolbarPlugin } from "./plugins/ToolbarPlugin";

export interface LexicalEditorProps {
  /** Placeholder text shown when empty */
  placeholder?: string;
  /** Markdown string to initialize the editor with */
  markdown?: string;
  /** Callback fired on every change, passing back pure markdown */
  onChange?: (markdown: string) => void;
  /** Puts the editor in read-only mode */
  readOnly?: boolean;
  className?: string;
}

// Internal plugin to optionally load and emit Markdown
function MarkdownBridgePlugin({
  initialMarkdown,
  onChange,
}: {
  initialMarkdown?: string;
  onChange?: (markdown: string) => void;
}) {
  const [editor] = useLexicalComposerContext();

  // Load initial markdown into the editor
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
}: LexicalEditorProps) => {
  const editorConfig = {
    namespace: "ChesaiLexicalEditor",
    theme: lexicalTheme,
    editable: !readOnly,
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
    ],
  };

  return (
    <div
      className={clsx(
        "flex flex-col relative w-full border border-outline-variant bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden transition-all",
        !readOnly &&
          "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1",
        readOnly && "bg-transparent border-transparent",
        className,
      )}
    >
      <LexicalComposer initialConfig={editorConfig}>
        {!readOnly && <ToolbarPlugin />}

        <div className="relative flex-1">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={clsx(
                  "min-h-[250px] outline-none p-5 w-full h-full text-on-surface caret-primary",
                  readOnly && "p-0",
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
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />

          <MarkdownBridgePlugin
            initialMarkdown={markdown}
            onChange={onChange}
          />
        </div>
      </LexicalComposer>
    </div>
  );
};
