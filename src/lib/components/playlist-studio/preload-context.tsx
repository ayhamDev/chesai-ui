// src/lib/components/playlist-studio/preload-context.tsx
"use client";

import React, { createContext, useContext } from "react";

export interface PreloadContextValue {
  registerAsset: (id: string, type: "Video" | "Audio" | "Image" | "Html") => void;
  unregisterAsset: (id: string) => void;
  setAssetReady: (id: string, ready: boolean, isActive: boolean) => void;
}

export const PreloadContext = createContext<PreloadContextValue | null>(null);

export const usePreload = () => useContext(PreloadContext);
