// src/lib/components/code-view/index.tsx
"use client";

import { DiffEditor, Editor, useMonaco } from "@monaco-editor/react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Columns,
  Copy,
  FileCode2,
  LayoutList,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeProvider";
import { ContextMenu } from "../context-menu";
import { IconButton } from "../icon-button";
import { Typography } from "../typography";

const codeEditorVariants = cva(
  "relative flex flex-col overflow-hidden border transition-colors duration-300 w-full",
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
    },
    defaultVariants: {
      variant: "primary",
      shape: "minimal",
      shadow: "none",
    },
  },
);

const toolbarSizeMap = {
  sm: {
    container: "h-8 px-2",
    icon: "h-3.5 w-3.5",
    text: "text-xs",
    buttonSize: "xs",
  },
  md: {
    container: "h-10 px-3",
    icon: "h-4 w-4",
    text: "text-sm",
    buttonSize: "xs",
  },
  lg: {
    container: "h-12 px-4",
    icon: "h-5 w-5",
    text: "text-base",
    buttonSize: "sm",
  },
} as const;

export interface CodeEditorProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof codeEditorVariants> {
  value?: string;
  original?: string;
  language?: string;
  isDiff?: boolean;
  readOnly?: boolean;
  height?: string | number;
  fileName?: string;
  contextMenu?: React.ReactNode;
  onChange?: (value: string | undefined) => void;
  options?: any;
  /** Enables a collapse/expand toggle in the header */
  collapsible?: boolean;
  /** Initial state for the collapsible behavior */
  defaultCollapsed?: boolean;
  /** Shows a copy button in the header toolbar */
  enableCopy?: boolean;
  /** The size of the top toolbar */
  toolbarSize?: "sm" | "md" | "lg";
  /** Inject custom actions or components into the toolbar */
  toolbarContent?: React.ReactNode;
}

export const CodeEditor = React.forwardRef<HTMLDivElement, CodeEditorProps>(
  (
    {
      value = "",
      original = "",
      language = "typescript",
      isDiff = false,
      readOnly = false,
      height = 400,
      fileName,
      contextMenu,
      onChange,
      options = {},
      variant,
      shape,
      shadow,
      className,
      collapsible = false,
      defaultCollapsed = false,
      enableCopy = true,
      toolbarSize = "md",
      toolbarContent,
      ...props
    },
    ref,
  ) => {
    const { resolvedTheme } = useTheme();
    const monaco = useMonaco();
    const [isEditorReady, setIsEditorReady] = useState(false);

    // Toolbar States
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [isSideBySide, setIsSideBySide] = useState(true);
    const [isCopied, setIsCopied] = useState(false);

    const activeTheme =
      resolvedTheme === "dark" ? "chesai-dark" : "chesai-light";

    const handleBeforeMount = (monacoInstance: any) => {
      monacoInstance.editor.defineTheme("chesai-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#00000000",
          "editor.lineHighlightBackground": "#ffffff0a",
          "editorLineNumber.foreground": "#85736E",
          "editor.selectionBackground": "#ffffff20",
        },
      });
      monacoInstance.editor.defineTheme("chesai-light", {
        base: "vs",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#00000000",
          "editor.lineHighlightBackground": "#0000000a",
          "editorLineNumber.foreground": "#85736E",
          "editor.selectionBackground": "#00000020",
        },
      });

      monacoInstance.languages.typescript.typescriptDefaults.setCompilerOptions(
        {
          jsx: monacoInstance.languages.typescript.JsxEmit.React,
          allowNonTsExtensions: true,
        },
      );

      monacoInstance.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
        {
          noSemanticValidation: true,
          noSyntaxValidation: false,
        },
      );
    };

    useEffect(() => {
      if (monaco) {
        monaco.editor.setTheme(activeTheme);
      }
    }, [monaco, activeTheme]);

    const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(value || "");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    const toggleDiffView = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsSideBySide((prev) => !prev);
    };

    const toggleCollapse = () => {
      if (collapsible) {
        setIsCollapsed((prev) => !prev);
      }
    };

    const editorOptions = {
      readOnly,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      fontLigatures: true,
      smoothScrolling: true,
      cursorBlinking: "smooth",
      padding: { top: 16, bottom: 16 },
      contextmenu: !contextMenu,
      ...options,
    };

    const handleEditorMount = () => {
      setIsEditorReady(true);
    };

    const EditorComponent = isDiff ? (
      <DiffEditor
        original={original}
        modified={value}
        language={language}
        theme={activeTheme}
        options={{
          ...editorOptions,
          renderSideBySide: isSideBySide,
        }}
        height="100%"
        beforeMount={handleBeforeMount}
        onMount={handleEditorMount}
      />
    ) : (
      <Editor
        value={value}
        language={language}
        theme={activeTheme}
        options={editorOptions}
        onChange={onChange}
        height="100%"
        beforeMount={handleBeforeMount}
        onMount={handleEditorMount}
      />
    );

    const tSize = toolbarSizeMap[toolbarSize];

    const Container = (
      <div
        ref={ref}
        className={clsx(
          codeEditorVariants({ variant, shape, shadow }),
          className,
        )}
        {...props}
      >
        {/* HEADER / TOOLBAR */}
        {(fileName ||
          collapsible ||
          enableCopy ||
          isDiff ||
          toolbarContent) && (
          <div
            className={clsx(
              "flex shrink-0 items-center gap-2 border-b border-outline-variant/30 bg-surface-container-highest/30",
              tSize.container,
              collapsible &&
                "cursor-pointer hover:bg-surface-container-highest/50 transition-colors",
            )}
            onClick={toggleCollapse}
          >
            {collapsible && (
              <div className="text-on-surface-variant opacity-70 transition-transform">
                {isCollapsed ? (
                  <ChevronRight className={tSize.icon} />
                ) : (
                  <ChevronDown className={tSize.icon} />
                )}
              </div>
            )}

            {fileName && (
              <>
                <FileCode2
                  className={clsx(
                    "text-on-surface-variant opacity-70",
                    tSize.icon,
                  )}
                />
                <Typography
                  className={clsx(
                    "font-mono text-on-surface-variant select-none",
                    tSize.text,
                  )}
                >
                  {fileName}
                </Typography>
              </>
            )}

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              {toolbarContent && (
                <div
                  className="flex items-center gap-1 mr-1"
                  onClick={(e) => e.stopPropagation()} // Prevent clicking custom actions from collapsing the editor
                >
                  {toolbarContent}
                </div>
              )}

              {isDiff && !isCollapsed && (
                <div className="hidden sm:flex items-center gap-2 mr-2">
                  <span className="flex items-center gap-1 text-[10px] font-mono text-error">
                    <span className="h-2 w-2 rounded-full bg-error" /> Original
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-green-500">
                    <span className="h-2 w-2 rounded-full bg-green-500" />{" "}
                    Modified
                  </span>
                </div>
              )}

              {/* BUILT-IN ACTIONS TOOLBAR */}
              <div className="flex items-center gap-1">
                {isDiff && !isCollapsed && (
                  <IconButton
                    variant="ghost"
                    size={tSize.buttonSize as any}
                    onClick={toggleDiffView}
                    aria-label="Toggle diff view"
                    className="text-on-surface-variant hover:text-on-surface"
                  >
                    {isSideBySide ? (
                      <LayoutList className={tSize.icon} />
                    ) : (
                      <Columns className={tSize.icon} />
                    )}
                  </IconButton>
                )}
                {enableCopy && (
                  <IconButton
                    variant="ghost"
                    size={tSize.buttonSize as any}
                    onClick={handleCopy}
                    aria-label="Copy code"
                    className={clsx(
                      "text-on-surface-variant hover:text-on-surface",
                      isCopied && "text-green-500 hover:text-green-600",
                    )}
                  >
                    {isCopied ? (
                      <Check className={tSize.icon} />
                    ) : (
                      <Copy className={tSize.icon} />
                    )}
                  </IconButton>
                )}
              </div>
            </div>
          </div>
        )}

        {/* EDITOR BODY WITH ANIMATED HEIGHT */}
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: height,
                opacity: isEditorReady ? 1 : 0,
              }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full relative overflow-hidden"
            >
              {EditorComponent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );

    if (contextMenu && !isCollapsed) {
      return (
        <ContextMenu>
          <ContextMenu.Trigger asChild>{Container}</ContextMenu.Trigger>
          {contextMenu}
        </ContextMenu>
      );
    }

    return Container;
  },
);

CodeEditor.displayName = "CodeEditor";
