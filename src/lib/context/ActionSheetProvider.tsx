"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Avatar } from "../components/avatar";
import { Button } from "../components/button";
import { ElasticScrollArea } from "../components/elastic-scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetGrabber,
  SheetHeader,
  SheetTitle,
} from "../components/sheet";
import { Typography } from "../components/typography";

// --- TYPES ---

export interface ActionSheetItem {
  id: string | number;
  label?: React.ReactNode;
  subLabel?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "default" | "destructive" | "image";
  keepOpen?: boolean;
  imageSrc?: string;
  onClick?: () => void | Promise<void>;
  shape?: "full" | "minimal" | "sharp";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

export interface ActionSheetSection {
  id?: string;
  title?: string;
  type: "list" | "grid" | "carousel" | "custom";
  items?: ActionSheetItem[];
  content?: React.ReactNode;
  gridColumns?: number;
}

export interface ActionSheetConfig {
  title?: React.ReactNode;
  description?: React.ReactNode;
  header?: React.ReactNode;
  sections: ActionSheetSection[];
  cancelLabel?: string;
  sheetProps?: Partial<React.ComponentProps<typeof Sheet>>;
  contentProps?: React.ComponentProps<typeof SheetContent>;
  variant?: React.ComponentProps<typeof Sheet>["variant"];
  /**
   * Optional callback to sync external state.
   * Called when the sheet opening state changes.
   */
  onOpenChange?: (isOpen: boolean) => void;
}

interface ActiveSheetInstance {
  id: string;
  name: string;
  props: any;
  isOpen: boolean;
  resolve: (value: any) => void;
}

interface ActionSheetContextType {
  show: (config: ActionSheetConfig) => Promise<string | number | null>;
  registerSheet: (name: string, component: React.FC<any>) => void;
  openSheet: <T = any>(name: string, props?: T) => Promise<any>;
  close: (id?: string) => void;
  lock: () => void;
  unlock: () => void;
  isLocked: boolean;
}

// --- HELPERS ---

const getShapeClass = (shape?: "full" | "minimal" | "sharp") => {
  switch (shape) {
    case "minimal":
      return "rounded-2xl";
    case "sharp":
      return "rounded-none";
    case "full":
    default:
      return "rounded-full";
  }
};

// --- DEFAULT RENDERER ---

const StandardSheetRenderer = ({
  onClose,
  onSelect,
  ...config
}: ActionSheetConfig & {
  onClose: () => void;
  onSelect: (val: any) => void;
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { lock, unlock, isLocked } = useActionSheet();
  const [loadingId, setLoadingId] = useState<string | number | null>(null);

  const handleItemClick = async (item: ActionSheetItem) => {
    if (item.disabled || isLocked) return;

    if (item.onClick) {
      const result = item.onClick();

      // Handle Async Actions
      if (result instanceof Promise) {
        setLoadingId(item.id);
        lock();
        try {
          await result;
          unlock();
          onSelect(item.id);
          if (!item.keepOpen) onClose();
        } catch (error) {
          console.error("ActionSheet Click Error:", error);
          unlock();
          setLoadingId(null);
        }
        return;
      }
    }

    // Handle Sync Actions
    onSelect(item.id);
    if (!item.keepOpen) onClose();
  };

  const { cancelLabel, sections, title, description, header, contentProps } =
    config;

  return (
    <SheetContent
      className={clsx(
        "p-0 pb-safe overflow-hidden flex flex-col",
        !isMobile && "max-w-md mx-auto",
        contentProps?.className,
      )}
      {...contentProps}
    >
      <SheetGrabber />
      <div className="px-6 my-4 pt-0 text-center">
        {(header || title || description) && (
          <div>
            {header ? (
              header
            ) : (
              <SheetHeader>
                {title && <SheetTitle>{title}</SheetTitle>}
                {description && (
                  <SheetDescription>{description}</SheetDescription>
                )}
              </SheetHeader>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-2">
        {sections.map((section, index) => (
          <React.Fragment key={index}>
            {section.title && (
              <Typography
                variant="label-small"
                className="px-6 py-2 mt-2 font-bold opacity-50 uppercase tracking-wider block"
              >
                {section.title}
              </Typography>
            )}

            {section.type === "list" && section.items && (
              <div className="flex flex-col gap-1 px-2">
                {section.items.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size={item.size || "lg"}
                    shape={item.shape || "minimal"}
                    disabled={
                      item.disabled || (isLocked && loadingId !== item.id)
                    }
                    isLoading={loadingId === item.id}
                    className={clsx(
                      "justify-start h-14 px-4",
                      item.variant === "destructive" &&
                        "text-error hover:text-error hover:bg-error/10",
                      item.className,
                    )}
                    onClick={() => handleItemClick(item)}
                  >
                    {item.icon && (
                      <span className="mr-4 opacity-70">{item.icon}</span>
                    )}
                    <div className="flex flex-col items-start text-left">
                      <span className="text-base font-semibold">
                        {item.label}
                      </span>
                      {item.subLabel && (
                        <span className="text-xs font-normal opacity-60">
                          {item.subLabel}
                        </span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {section.type === "grid" && section.items && (
              <div
                className="grid gap-4 px-4 py-2"
                style={{
                  gridTemplateColumns: `repeat(${section.gridColumns || 4}, minmax(0, 1fr))`,
                }}
              >
                {section.items.map((item) => {
                  const shapeClass = getShapeClass(item.shape);
                  const isLoading = loadingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={clsx(
                        "flex flex-col items-center gap-2 cursor-pointer group select-none transition-opacity",
                        (item.disabled || (isLocked && !isLoading)) &&
                          "opacity-50 pointer-events-none",
                        item.className,
                      )}
                      onClick={() => handleItemClick(item)}
                    >
                      <div
                        className={clsx(
                          "flex h-12 w-12 items-center justify-center bg-surface-container-highest text-on-surface transition-transform group-active:scale-95 group-hover:bg-secondary-container",
                          shapeClass,
                        )}
                      >
                        {isLoading ? (
                          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                        ) : (
                          item.icon
                        )}
                      </div>
                      <span className="text-xs font-medium text-center leading-tight opacity-80 line-clamp-2">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {section.type === "carousel" && section.items && (
              <ElasticScrollArea
                orientation="horizontal"
                scrollbarVisibility="hidden"
                className="!h-auto"
              >
                <div className="flex gap-4 px-6 pb-4 pt-2">
                  {section.items.map((item) => {
                    const shapeClass = getShapeClass(item.shape);
                    const isLoading = loadingId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={clsx(
                          "flex w-[72px] shrink-0 flex-col items-center gap-2 cursor-pointer group select-none",
                          (item.disabled || (isLocked && !isLoading)) &&
                            "opacity-50 pointer-events-none",
                          item.className,
                        )}
                        onClick={() => handleItemClick(item)}
                      >
                        {item.variant === "image" ? (
                          <div className="relative">
                            <Avatar
                              src={item.imageSrc}
                              fallback={item.label?.toString()[0]}
                              size="lg"
                              shape={item.shape || "full"}
                              className="ring-2 ring-transparent group-hover:ring-primary transition-all"
                            />
                            {isLoading && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-full">
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className={clsx(
                              "flex h-14 w-14 items-center justify-center bg-surface-container-highest text-on-surface transition-transform group-active:scale-95 group-hover:bg-secondary-container",
                              shapeClass,
                            )}
                          >
                            {isLoading ? (
                              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                            ) : (
                              item.icon
                            )}
                          </div>
                        )}
                        <div className="flex flex-col items-center text-center">
                          <span className="text-xs font-medium leading-tight line-clamp-1">
                            {item.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ElasticScrollArea>
            )}

            {section.type === "custom" && section.content}

            {index < sections.length - 1 && (
              <div className="h-px w-full bg-outline-variant/30 my-2" />
            )}
          </React.Fragment>
        ))}
      </div>

      {cancelLabel && (
        <SheetFooter className="p-4 pt-2">
          <Button
            variant="secondary"
            size="lg"
            shape="full"
            className="w-full font-semibold"
            onClick={onClose}
            disabled={isLocked}
          >
            {cancelLabel}
          </Button>
        </SheetFooter>
      )}
    </SheetContent>
  );
};

// --- CONTEXT ---

const ActionSheetContext = createContext<ActionSheetContextType | null>(null);

export const useActionSheet = () => {
  const context = useContext(ActionSheetContext);
  if (!context) {
    throw new Error(
      "useActionSheet must be used within an ActionSheetProvider",
    );
  }
  return context;
};

// --- PROVIDER ---

export const ActionSheetProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const registry = useRef<Record<string, React.FC<any>>>({});
  const [stack, setStack] = useState<ActiveSheetInstance[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const lock = useCallback(() => setIsLocked(true), []);
  const unlock = useCallback(() => setIsLocked(false), []);

  const registerSheet = useCallback(
    (name: string, component: React.FC<any>) => {
      registry.current[name] = component;
    },
    [],
  );

  const close = useCallback(
    (id?: string) => {
      if (isLocked) return;

      setStack((currentStack) => {
        // If ID provided, close specific sheet
        if (id) {
          const target = currentStack.find((s) => s.id === id);
          if (target?.props?.onOpenChange) {
            target.props.onOpenChange(false);
          }
          return currentStack.map((s) =>
            s.id === id ? { ...s, isOpen: false } : s,
          );
        }

        // Otherwise close top-most
        const lastOpenIndex = currentStack
          .map((s) => s.isOpen)
          .lastIndexOf(true);
        if (lastOpenIndex !== -1) {
          const target = currentStack[lastOpenIndex];
          if (target?.props?.onOpenChange) {
            target.props.onOpenChange(false);
          }
          return currentStack.map((s, i) =>
            i === lastOpenIndex ? { ...s, isOpen: false } : s,
          );
        }
        return currentStack;
      });
    },
    [isLocked],
  );

  const openSheet = useCallback(
    <T = any,>(name: string, props?: T): Promise<any> => {
      return new Promise((resolve) => {
        const id = crypto.randomUUID();

        // Trigger onOpenChange(true) if provided
        if ((props as any)?.onOpenChange) {
          (props as any).onOpenChange(true);
        }

        setStack((prev) => [
          ...prev,
          { id, name, props, isOpen: true, resolve },
        ]);
      });
    },
    [],
  );

  const show = useCallback(
    (config: ActionSheetConfig) => {
      return openSheet("standard", config);
    },
    [openSheet],
  );

  useEffect(() => {
    const closedSheets = stack.filter((s) => !s.isOpen);
    if (closedSheets.length > 0) {
      const timeout = setTimeout(() => {
        setStack((current) => current.filter((s) => s.isOpen));
        closedSheets.forEach((s) => s.resolve(null));
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [stack]);

  useEffect(() => {
    registerSheet("standard", StandardSheetRenderer);
  }, [registerSheet]);

  return (
    <ActionSheetContext.Provider
      value={{ show, registerSheet, openSheet, close, lock, unlock, isLocked }}
    >
      {children}
      {stack.map((instance, index) => {
        const Component = registry.current[instance.name];
        if (!Component) return null;
        const isStandard = instance.name === "standard";
        const zIndex = 50 + index;

        return (
          <Sheet
            key={instance.id}
            open={instance.isOpen}
            isLocked={isLocked} // Pass lock to the Sheet component
            onOpenChange={(open) => {
              // Sync external state if provided
              if (instance.props.onOpenChange) {
                instance.props.onOpenChange(open);
              }
              if (!open && !isLocked) close(instance.id);
            }}
            forceBottomSheet={isMobile}
            mode="detached"
            {...((isStandard && instance.props.sheetProps) || {})}
            style={{ zIndex, position: "relative" }}
          >
            <Component
              {...instance.props}
              onClose={() => close(instance.id)}
              onSelect={(val: any) => instance.resolve(val)}
            />
          </Sheet>
        );
      })}
    </ActionSheetContext.Provider>
  );
};
