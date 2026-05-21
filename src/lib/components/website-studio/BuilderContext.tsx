"use client";

import React, { createContext, useContext } from "react";
import type { ComponentRegistry } from "./types";

interface BuilderContextValue {
  components: ComponentRegistry;
  cms?: any; // <-- Added to hold dynamic data
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export const useBuilderContext = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error(
      "useBuilderContext must be used within a BuilderContextProvider",
    );
  }
  return context;
};

export const BuilderContextProvider = ({
  children,
  components,
  cms,
}: BuilderContextValue & { children: React.ReactNode }) => {
  return (
    <BuilderContext.Provider value={{ components, cms }}>
      {children}
    </BuilderContext.Provider>
  );
};
