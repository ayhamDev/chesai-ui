// src/lib/components/lexical-editor/plugins/ToolbarPlugin.tsx
"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import { $createCodeNode } from "@lexical/code";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Toolbar } from "../../toolbar";

export const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const [align, setAlign] = useState("left");

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Text Formats
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));

      // Alignment
      // @ts-ignore
      setAlign(selection.format || "left");

      // Block Type
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
      }

      // Links
      const node = selection.isBackward()
        ? selection.focus.getNode()
        : selection.anchor.getNode();
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));
    }
  }, [activeEditor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => updateToolbar());
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar();
          setActiveEditor(newEditor);
          return false;
        },
        1,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        1,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        1,
      ),
    );
  }, [editor, updateToolbar]);

  const formatHeading = (headingSize: "h1" | "h2") => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    } else formatParagraph();
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    } else formatParagraph();
  };

  const formatCodeBlock = () => {
    if (blockType !== "code") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createCodeNode());
        }
      });
    } else formatParagraph();
  };

  const insertLink = useCallback(() => {
    if (!isLink) {
      const url = window.prompt("Enter URL:", "https://");
      if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
    <Toolbar
      variant="ghost"
      size="sm"
      shape="sharp"
      className="w-full flex-wrap border-b border-outline-variant/50 bg-surface-container/50 px-2 py-1.5"
    >
      <Toolbar.Button
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        tooltip="Undo"
        shortcut="⌘Z"
      >
        <Undo className="w-4 h-4" />
      </Toolbar.Button>
      <Toolbar.Button
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        tooltip="Redo"
        shortcut="⇧⌘Z"
      >
        <Redo className="w-4 h-4" />
      </Toolbar.Button>

      <Toolbar.Separator />

      <Toolbar.ToggleGroup type="multiple">
        <Toolbar.ToggleItem
          value="bold"
          data-state={isBold ? "on" : "off"}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          tooltip="Bold"
          shortcut="⌘B"
        >
          <Bold className="w-4 h-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value="italic"
          data-state={isItalic ? "on" : "off"}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          tooltip="Italic"
          shortcut="⌘I"
        >
          <Italic className="w-4 h-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value="underline"
          data-state={isUnderline ? "on" : "off"}
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
          }
          tooltip="Underline"
          shortcut="⌘U"
        >
          <Underline className="w-4 h-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value="strikethrough"
          data-state={isStrikethrough ? "on" : "off"}
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
          }
          tooltip="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value="code"
          data-state={isCode ? "on" : "off"}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
          tooltip="Inline Code"
        >
          <Code className="w-4 h-4" />
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>

      <Toolbar.Separator />

      <Toolbar.Button
        onClick={insertLink}
        data-state={isLink ? "on" : "off"}
        tooltip="Insert Link"
        shortcut="⌘K"
      >
        <LinkIcon className="w-4 h-4" />
      </Toolbar.Button>

      <Toolbar.Separator />

      <Toolbar.ToggleGroup
        type="single"
        value={blockType}
        onValueChange={() => {}}
      >
        <Toolbar.ToggleItem
          value="h1"
          onClick={() => formatHeading("h1")}
          tooltip="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value="h2"
          onClick={() => formatHeading("h2")}
          tooltip="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value="bullet"
          onClick={formatBulletList}
          tooltip="Bullet List"
        >
          <List className="w-4 h-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value="number"
          onClick={formatNumberedList}
          tooltip="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value="quote"
          onClick={formatQuote}
          tooltip="Quote Block"
        >
          <Quote className="w-4 h-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value="code"
          onClick={formatCodeBlock}
          tooltip="Code Block"
        >
          <Code className="w-4 h-4" />
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>

      <Toolbar.Separator />

      <Toolbar.ToggleGroup type="single" value={align}>
        <Toolbar.ToggleItem
          value="left"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
          tooltip="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value="center"
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")
          }
          tooltip="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value="right"
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")
          }
          tooltip="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value="justify"
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")
          }
          tooltip="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>
    </Toolbar>
  );
};
