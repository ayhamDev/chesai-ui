"use client";

import React, { createContext, useContext } from "react";
import type { ComponentRegistry, DesignSystemSchema } from "./types";

interface BuilderContextValue {
  components: ComponentRegistry;
  cms?: any;
  actions?: Record<string, Function>;
  customApi?: any;
  globalHeadCode?: string;
  globalBodyCode?: string;
  designSystem?: DesignSystemSchema;
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
  globalHeadCode,
  globalBodyCode,
  designSystem,
}: BuilderContextValue & { children: React.ReactNode }) => {
  return (
    <BuilderContext.Provider
      value={{
        components,
        cms,
        actions,
        customApi,
        globalHeadCode,
        globalBodyCode,
        designSystem,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};
