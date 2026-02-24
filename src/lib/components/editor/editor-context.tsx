"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface Camera {
  x: number;
  y: number;
  z: number;
}

interface EditorContextProps {
  mode: "infinite" | "paper";
  camera: Camera;
  setCamera: React.Dispatch<React.SetStateAction<Camera>>;
  isSpacePressed: boolean;
  setIsSpacePressed: React.Dispatch<React.SetStateAction<boolean>>;
  isAltPressed: boolean;
  readOnly: boolean;
  gridSize: number;
  showGrid: boolean;
  selectedIds: Set<string>;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  selectId: (id: string, multi?: boolean) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  registerItem: (id: string, node: HTMLElement) => void;
  unregisterItem: (id: string) => void;
  getItemRect: (id: string) => DOMRect | null;
}

const EditorContext = createContext<EditorContextProps | null>(null);

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context)
    throw new Error("useEditor must be used within an <Editor.Root>");
  return context;
};

export interface EditorRootProps {
  children: React.ReactNode;
  mode?: "infinite" | "paper";
  initialCamera?: Camera;
  readOnly?: boolean;
  gridSize?: number;
  showGrid?: boolean;
}

export const EditorRoot = ({
  children,
  mode = "infinite",
  initialCamera = { x: 0, y: 0, z: 1 },
  readOnly = false,
  gridSize = 20,
  showGrid = true,
}: EditorRootProps) => {
  const [camera, setCamera] = useState<Camera>(initialCamera);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Track ALT key securely across the window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt" || e.altKey) setIsAltPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt" || !e.altKey) setIsAltPressed(false);
    };
    // Failsafe: if window loses focus while alt is pressed
    const handleBlur = () => setIsAltPressed(false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const selectId = (id: string, multi = false) => {
    if (readOnly) return;
    setSelectedIds((prev) => {
      const next = new Set(multi ? prev : []);
      if (next.has(id) && multi) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = (ids: string[]) => {
    if (!readOnly) setSelectedIds(new Set(ids));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const registerItem = (id: string, node: HTMLElement) =>
    itemRefs.current.set(id, node);
  const unregisterItem = (id: string) => itemRefs.current.delete(id);
  const getItemRect = (id: string) => {
    const node = itemRefs.current.get(id);
    return node ? node.getBoundingClientRect() : null;
  };

  return (
    <EditorContext.Provider
      value={{
        mode,
        camera,
        setCamera,
        isSpacePressed,
        setIsSpacePressed,
        isAltPressed,
        readOnly,
        gridSize,
        showGrid,
        selectedIds,
        hoveredId,
        setHoveredId,
        selectId,
        selectAll,
        clearSelection,
        registerItem,
        unregisterItem,
        getItemRect,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
