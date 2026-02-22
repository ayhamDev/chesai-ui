// src/lib/components/editor/editor-context.tsx
"use client";

import React, { createContext, useContext, useState } from "react";

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
  readOnly: boolean;
  gridSize: number;
  showGrid: boolean;
  selectedIds: Set<string>;
  selectId: (id: string, multi?: boolean) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
}

const EditorContext = createContext<EditorContextProps | null>(null);

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an <Editor.Root>");
  }
  return context;
};

interface EditorRootProps {
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectId = (id: string, multi = false) => {
    if (readOnly) return;
    setSelectedIds((prev) => {
      const next = new Set(multi ? prev : []);
      if (next.has(id) && multi) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = (ids: string[]) => {
    if (readOnly) return;
    setSelectedIds(new Set(ids));
  };

  const clearSelection = () => setSelectedIds(new Set());

  return (
    <EditorContext.Provider
      value={{
        mode,
        camera,
        setCamera,
        isSpacePressed,
        setIsSpacePressed,
        readOnly,
        gridSize,
        showGrid,
        selectedIds,
        selectId,
        selectAll,
        clearSelection,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
