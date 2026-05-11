"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface BreadcrumbItemType {
  id: string; // Unique ID for Framer Motion keys
  label: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  isCurrent?: boolean;
}

export interface BreadcrumbContextType {
  items: BreadcrumbItemType[];
  setItems: (items: BreadcrumbItemType[]) => void;
  addItem: (item: Omit<BreadcrumbItemType, "id">) => void;
  removeItem: (id: string) => void;
  popItem: () => void;
  reset: () => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | null>(null);

export const useBreadcrumbs = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumbs must be used within a BreadcrumbProvider");
  }
  return context;
};

export const BreadcrumbProvider = ({
  children,
  defaultItems = [],
}: {
  children: React.ReactNode;
  defaultItems?: BreadcrumbItemType[];
}) => {
  const [items, setItems] = useState<BreadcrumbItemType[]>(defaultItems);

  const addItem = useCallback((item: Omit<BreadcrumbItemType, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setItems((prev) => [...prev, { ...item, id }]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const popItem = useCallback(() => {
    setItems((prev) => prev.slice(0, -1));
  }, []);

  const reset = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <BreadcrumbContext.Provider
      value={{ items, setItems, addItem, removeItem, popItem, reset }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
};
