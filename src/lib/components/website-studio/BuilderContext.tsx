"use client";

import React, { createContext, useContext } from "react";
import type { ComponentRegistry } from "./types";

interface BuilderContextValue {
  components: ComponentRegistry;
  cms?: any;
  actions?: Record<string, Function>; // Added to hold global actions
  customApi?: any; // Added to hold custom API for sandboxed code
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
  actions,
  customApi,
}: BuilderContextValue & { children: React.ReactNode }) => {
  return (
    <BuilderContext.Provider value={{ components, cms, actions, customApi }}>
      {children}
    </BuilderContext.Provider>
  );
};
