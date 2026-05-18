// src/lib/components/code-editor/index.tsx
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

export interface CodeEditorAction {
  id: string;
  label: string;
  keybindings?: number[];
  contextMenuGroupId?: string;
  contextMenuOrder?: number;
  run: (editor: any, monaco: any) => void;
}

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
  onChange?: (value: string | undefined) => void;
  options?: any;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  enableCopy?: boolean;
  toolbarSize?: "sm" | "md" | "lg";
  toolbarContent?: React.ReactNode;
  hideToolbar?: boolean;
  disableContextMenu?: boolean;
  customActions?: CodeEditorAction[];
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
      hideToolbar = false,
      disableContextMenu = false,
      customActions,
      ...props
    },
    ref,
  ) => {
    const { resolvedTheme } = useTheme();
    const monaco = useMonaco();
    const [isEditorReady, setIsEditorReady] = useState(false);

    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [isSideBySide, setIsSideBySide] = useState(true);
    const [isCopied, setIsCopied] = useState(false);

    const activeTheme =
      resolvedTheme === "dark" ? "chesai-dark" : "chesai-light";

    const handleBeforeMount = (monacoInstance: any) => {
      // 1. Define Visual Themes
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

      // 2. CONFIGURE TYPESCRIPT TO SUPPORT JSX (The fix for the typos/errors)
      monacoInstance.languages.typescript.typescriptDefaults.setCompilerOptions(
        {
          jsx: monacoInstance.languages.typescript.JsxEmit.React, // Enables JSX parsing
          allowNonTsExtensions: true,
          target: monacoInstance.languages.typescript.ScriptTarget.Latest,
          allowJs: true,
          module: monacoInstance.languages.typescript.ModuleKind.ESNext,
        },
      );

      // Optional: Add basic React types for better intellisense
      // monacoInstance.languages.typescript.typescriptDefaults.addExtraLib(
      //   `declare module 'react' {
      //     export function useState<T>(initial: T): [T, (val: T) => void];
      //     export default { useState };
      //   }`,
      //   "file:///node_modules/@types/react/index.d.ts",
      // );
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
      if (collapsible) setIsCollapsed((prev) => !prev);
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
      contextmenu: !disableContextMenu,
      ...options,
    };

    const handleEditorMount = (editorInstance: any, monacoInstance: any) => {
      setIsEditorReady(true);

      const targetEditor = isDiff
        ? editorInstance.getModifiedEditor()
        : editorInstance;

      if (customActions && targetEditor) {
        customActions.forEach((action) => {
          targetEditor.addAction({
            id: action.id,
            label: action.label,
            keybindings: action.keybindings,
            contextMenuGroupId: action.contextMenuGroupId || "navigation",
            contextMenuOrder: action.contextMenuOrder || 1.5,
            run: () => action.run(targetEditor, monacoInstance),
          });
        });
      }
    };

    // 3. FORCE .TSX PATH (The secondary fix for JSX errors)
    // Monaco needs to see a .tsx extension in the virtual file path
    // to enable the JSX parser for that specific model.
    const path = fileName
      ? fileName.endsWith("x")
        ? fileName
        : `${fileName}x`
      : "model.tsx";

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
        path={path} // Setting the path ensures TSX mode is active
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
    const shouldShowToolbar =
      !hideToolbar &&
      (fileName || collapsible || enableCopy || isDiff || toolbarContent);

    return (
      <div
        ref={ref}
        className={clsx(
          codeEditorVariants({ variant, shape, shadow }),
          className,
        )}
        {...props}
      >
        {shouldShowToolbar && (
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
                  onClick={(e) => e.stopPropagation()}
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
  },
);

CodeEditor.displayName = "CodeEditor";
