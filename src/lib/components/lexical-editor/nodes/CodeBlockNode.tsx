// src/lib/components/lexical-editor/nodes/CodeBlockNode.tsx
import React from "react";
import {
  DecoratorNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
  $getNodeByKey,
  $applyNodeReplacement, // Imported for robust node initialization
} from "lexical";
import { CodeEditor } from "../../code-editor";

export type SerializedCodeBlockNode = Spread<
  {
    code: string;
    language: string;
    fileName?: string;
    hideToolbar?: boolean;
    collapsible?: boolean;
  },
  SerializedLexicalNode
>;

class CodeBlockNode extends DecoratorNode<React.ReactNode> {
  __code: string;
  __language: string;
  __fileName?: string;
  __hideToolbar?: boolean;
  __collapsible?: boolean;

  static getType(): string {
    return "code-block";
  }

  static clone(node: CodeBlockNode): CodeBlockNode {
    return new CodeBlockNode(
      node.__code,
      node.__language,
      node.__fileName,
      node.__hideToolbar,
      node.__collapsible,
      node.__key,
    );
  }

  constructor(
    code = "",
    language = "typescript",
    fileName?: string,
    hideToolbar?: boolean,
    collapsible?: boolean,
    key?: NodeKey,
  ) {
    super(key);
    this.__code = code;
    this.__language = language;
    this.__fileName = fileName;
    this.__hideToolbar = hideToolbar;
    this.__collapsible = collapsible;
  }

  static importJSON(serializedNode: SerializedCodeBlockNode): CodeBlockNode {
    const { code, language, fileName, hideToolbar, collapsible } =
      serializedNode;
    return $createCodeBlockNode(
      code,
      language,
      fileName,
      hideToolbar,
      collapsible,
    );
  }

  exportJSON(): SerializedCodeBlockNode {
    return {
      ...super.exportJSON(),
      type: "code-block",
      code: this.getCode(),
      language: this.getLanguage(),
      fileName: this.__fileName,
      hideToolbar: this.__hideToolbar,
      collapsible: this.__collapsible,
      version: 1,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.style.display = "block";
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  getCode(): string {
    return this.__code;
  }

  setCode(code: string): void {
    const writable = this.getWritable();
    writable.__code = code;
  }

  getLanguage(): string {
    return this.__language;
  }

  setLanguage(language: string): void {
    const writable = this.getWritable();
    writable.__language = language;
  }

  decorate(editor: any): React.ReactNode {
    return (
      <div className="my-4 relative select-none" contentEditable={false}>
        <CodeEditor
          value={this.__code}
          language={this.__language}
          fileName={this.__fileName}
          hideToolbar={this.__hideToolbar}
          collapsible={this.__collapsible}
          onChange={(val) => {
            editor.update(() => {
              const node = $getNodeByKey(this.__key);
              if ($isCodeBlockNode(node)) {
                node.setCode(val || "");
              }
            });
          }}
          variant="secondary"
          shape="minimal"
          enableCopy={true}
          toolbarSize="sm"
          className="h-fit"
        />
      </div>
    );
  }
}

export function $createCodeBlockNode(
  code?: string,
  language?: string,
  fileName?: string,
  hideToolbar?: boolean,
  collapsible?: boolean,
): CodeBlockNode {
  // Uses applyNodeReplacement to comply with Lexical's internal class matching
  return $applyNodeReplacement(
    new CodeBlockNode(code, language, fileName, hideToolbar, collapsible),
  );
}

export function $isCodeBlockNode(node: any): node is CodeBlockNode {
  return node instanceof CodeBlockNode;
}

// --- HMR CLASS IDENTITY GUARD ---
// Keeps the class constructor reference stable in development across hot reloads
const isDev = process.env.NODE_ENV === "development";
let ExportedCodeBlockNode = CodeBlockNode;

if (isDev && typeof window !== "undefined") {
  const globalRef = window as any;
  if (globalRef.__CodeBlockNode) {
    ExportedCodeBlockNode = globalRef.__CodeBlockNode;
  } else {
    globalRef.__CodeBlockNode = CodeBlockNode;
  }
}

export { ExportedCodeBlockNode as CodeBlockNode };
