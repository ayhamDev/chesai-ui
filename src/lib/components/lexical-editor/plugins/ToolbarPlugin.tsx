// src/lib/components/lexical-editor/plugins/ToolbarPlugin.tsx
"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createLinkNode,
  $isLinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
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
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $getNearestNodeFromDOMNode,
  CAN_REDO_COMMAND,
  CAN_REDO_COMMAND as CAN_UNDO_COMMAND,
  CLICK_COMMAND,
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
  Code, // <-- Added Lucide Icon
  Highlighter,
  ChevronDown,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Toolbar } from "../../toolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../dropdown-menu";
import { useDialog } from "../../../context/DialogProvider";
import { Input } from "../../input";
import { Switch } from "../../switch";
import { $createCodeBlockNode } from "../nodes/CodeBlockNode";

const blockTypeToLabel: Record<string, string> = {
  paragraph: "Normal Text",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  quote: "Quote",
};

export const ToolbarPlugin = ({
  shape = "minimal",
}: {
  shape?: "full" | "minimal" | "sharp";
}) => {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const { show } = useDialog();

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
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));

      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      const elementFormat = element.getFormatType();
      setAlign(elementFormat || "left");

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
        UNDO_COMMAND,
        () => {
          setCanUndo(editor.hasNodes());
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
      editor.registerCommand(
        CLICK_COMMAND,
        (payload: MouseEvent) => {
          const target = payload.target as HTMLElement;
          const linkElement = target.closest("a");

          if (linkElement) {
            editor.read(() => {
              let node = $getNearestNodeFromDOMNode(linkElement);
              if (node && !$isLinkNode(node)) {
                node = node.getParent();
              }

              if (node && $isLinkNode(node)) {
                const url = node.getURL();
                const text = node.getTextContent();
                const key = node.getKey();

                setTimeout(() => {
                  let tempUrl = url;
                  let tempText = text;

                  show({
                    title: "Edit Hyperlink",
                    body: (
                      <div className="flex flex-col gap-4 py-2">
                        <Input
                          label="Text to display"
                          defaultValue={tempText}
                          onChange={(e) => {
                            tempText = e.target.value;
                          }}
                        />
                        <Input
                          label="URL"
                          defaultValue={tempUrl}
                          onChange={(e) => {
                            tempUrl = e.target.value;
                          }}
                        />
                      </div>
                    ),
                    confirmLabel: "Update",
                    onConfirm: () => {
                      editor.update(() => {
                        const linkNode = $getNodeByKey(key);
                        if (linkNode && $isLinkNode(linkNode)) {
                          const textNode = $createTextNode(tempText);
                          if (!tempUrl || tempUrl === "https://") {
                            linkNode.replace(textNode);
                            textNode.select(0, tempText.length);
                          } else {
                            const newLinkNode = $createLinkNode(tempUrl);
                            newLinkNode.append(textNode);
                            linkNode.replace(newLinkNode);
                            textNode.select(0, tempText.length);
                          }
                        }
                      });
                    },
                  });
                }, 0);
              }
            });
            return true;
          }
          return false;
        },
        1,
      ),
    );
  }, [editor, updateToolbar, show]);

  const formatHeading = (
    headingSize: "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
  ) => {
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

  const formatCodeBlock = useCallback(() => {
    let fileName = "";
    let hideToolbar = false;
    let collapsible = false;

    show({
      title: "Insert Code Block",
      body: (
        <div className="flex flex-col gap-4 py-2">
          <Input
            label="File Name (Optional)"
            placeholder="e.g. main.tsx"
            onChange={(e) => {
              fileName = e.target.value;
            }}
            autoFocus
          />
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium">Hide Toolbar</span>
            <Switch
              onCheckedChange={(checked) => {
                hideToolbar = checked;
              }}
            />
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium">Collapsible</span>
            <Switch
              onCheckedChange={(checked) => {
                collapsible = checked;
              }}
            />
          </div>
        </div>
      ),
      confirmLabel: "Insert",
      onConfirm: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const codeBlockNode = $createCodeBlockNode(
              "// Write code here...",
              "typescript",
              fileName || undefined,
              hideToolbar,
              collapsible,
            );
            selection.insertNodes([codeBlockNode]);
          }
        });
      },
    });
  }, [editor, show]);

  const insertLink = useCallback(() => {
    let tempUrl = "https://";
    let tempText = "";
    let existingLinkKey: string | null = null;

    editor.read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        tempText = selection.getTextContent();

        if (isLink) {
          const node = selection.isBackward()
            ? selection.focus.getNode()
            : selection.anchor.getNode();
          const parent = node.getParent();
          if ($isLinkNode(parent)) {
            tempUrl = parent.getURL();
            existingLinkKey = parent.getKey();
          } else if ($isLinkNode(node)) {
            tempUrl = node.getURL();
            existingLinkKey = node.getKey();
          }
        }
      }
    });

    show({
      title: isLink ? "Edit Hyperlink" : "Insert Hyperlink",
      body: (
        <div className="flex flex-col gap-4 py-2">
          <Input
            label="Text to display"
            placeholder="e.g. Click here"
            defaultValue={tempText}
            onChange={(e) => {
              tempText = e.target.value;
            }}
            autoFocus
          />
          <Input
            label="URL"
            placeholder="https://example.com"
            defaultValue={tempUrl}
            onChange={(e) => {
              tempUrl = e.target.value;
            }}
          />
        </div>
      ),
      confirmLabel: isLink ? "Update" : "Insert",
      onConfirm: () => {
        editor.update(() => {
          if (isLink && existingLinkKey) {
            const linkNode = $getNodeByKey(existingLinkKey);
            if (linkNode && $isLinkNode(linkNode)) {
              const textNode = $createTextNode(tempText);
              if (!tempUrl || tempUrl === "https://") {
                linkNode.replace(textNode);
                textNode.select(0, tempText.length);
              } else {
                const newLinkNode = $createLinkNode(tempUrl);
                newLinkNode.append(textNode);
                linkNode.replace(newLinkNode);
                textNode.select(0, tempText.length);
              }
            }
          } else {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              if (tempText && tempText !== selection.getTextContent()) {
                const linkNode = $createLinkNode(tempUrl);
                const textNode = $createTextNode(tempText);
                linkNode.append(textNode);
                selection.insertNodes([linkNode]);
                textNode.select(0, tempText.length);
              } else {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, tempUrl);
              }
            }
          }
        });
      },
    });
  }, [editor, isLink, show]);

  return (
    <Toolbar
      variant="ghost"
      size="sm"
      shape={shape}
      className="w-full flex-wrap border-b border-outline-variant/30 bg-surface-container/40 px-2 py-1.5"
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

      <DropdownMenu shape={shape}>
        <DropdownMenuTrigger asChild>
          <Toolbar.Button
            tooltip="Typography Styles"
            className="w-fit justify-between gap-2 px-3 text-left font-medium"
          >
            <span className="truncate text-xs font-semibold">
              {blockTypeToLabel[blockType] || "Normal Text"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0" />
          </Toolbar.Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-52 max-h-80 overflow-y-auto"
        >
          <DropdownMenuItem onClick={formatParagraph}>
            <span className="body-large !text-xs">Normal Text</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => formatHeading("h1")}>
            <span className="display-small !text-base font-bold">
              Heading 1
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => formatHeading("h2")}>
            <span className="headline-large !text-sm font-semibold">
              Heading 2
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => formatHeading("h3")}>
            <span className="headline-medium !text-xs font-medium">
              Heading 3
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => formatHeading("h4")}>
            <span className="title-large !text-xs font-medium">Heading 4</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => formatHeading("h5")}>
            <span className="title-medium !text-xs font-medium">Heading 5</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => formatHeading("h6")}>
            <span className="title-small !text-xs font-medium">Heading 6</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={formatQuote}>
            <span className="blockquote !text-xs italic pl-2 border-l-2 border-primary">
              Quote
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
          tooltip="Highlight"
        >
          <Highlighter className="w-4 h-4" />
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

      {/* Dedicated Code Block Button */}
      <Toolbar.Button onClick={formatCodeBlock} tooltip="Insert Code Block">
        <Code className="w-4 h-4" />
      </Toolbar.Button>

      <Toolbar.Separator />

      <Toolbar.ToggleGroup
        type="single"
        value={blockType}
        onValueChange={() => {}}
      >
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
