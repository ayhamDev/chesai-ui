import { EditorRoot } from "./editor-context";
import { EditorCanvas } from "./editor-canvas";
import { EditorItem } from "./editor-item";

export const Editor = Object.assign(EditorRoot, {
  Root: EditorRoot,
  Canvas: EditorCanvas,
  Item: EditorItem,
});

export * from "./editor-context";
export * from "./editor-canvas";
export * from "./editor-item";
export * from "./editor-measurements";
