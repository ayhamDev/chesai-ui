"use client";

import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from "react";

export type Direction = "ltr" | "rtl";

interface LayoutContextType {
  direction: Direction;
  setDirection: (dir: Direction) => void;
  toggleDirection: () => void;
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
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({
  children,
  initialDirection = "ltr",
}) => {
  const [direction, setDirection] = useState<Direction>(initialDirection);

  // Sync direction with HTML attribute
  // We use useLayoutEffect to prevent flash of unstyled content (FOUC)
  useLayoutEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.style.direction = direction;

    // Optional: Add a class for CSS selectors if needed
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
      value={{ direction, setDirection, toggleDirection }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
