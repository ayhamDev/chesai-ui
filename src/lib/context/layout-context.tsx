"use client";

import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  useEffect,
} from "react";

export type Direction = "ltr" | "rtl";

interface LayoutContextType {
  direction: Direction;
  setDirection: (dir: Direction) => void;
  toggleDirection: () => void;
  isRtl: boolean;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};

interface LayoutProviderProps {
  children: React.ReactNode;
  initialDirection?: Direction;
  storageKey?: string;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({
  children,
  initialDirection = "ltr",
  storageKey = "layout-direction",
}) => {
  // Initialize from storage if available
  const [direction, setDirection] = useState<Direction>(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem(storageKey) as Direction) || initialDirection
      );
    }
    return initialDirection;
  });

  // Persist to storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, direction);
    }
  }, [direction, storageKey]);

  // Sync direction with HTML attribute
  useLayoutEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.style.direction = direction;

    if (direction === "rtl") {
      document.documentElement.classList.add("rtl");
      document.documentElement.classList.remove("ltr");
    } else {
      document.documentElement.classList.add("ltr");
      document.documentElement.classList.remove("rtl");
    }
  }, [direction]);

  const toggleDirection = () => {
    setDirection((prev) => (prev === "ltr" ? "rtl" : "ltr"));
  };

  return (
    <LayoutContext.Provider
      value={{
        direction,
        setDirection,
        toggleDirection,
        isRtl: direction === "rtl",
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
