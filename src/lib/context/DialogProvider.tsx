"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "../components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/dialog";
import { Typography } from "../components/typography";

// --- TYPES ---
export interface DialogConfig {
  title?: React.ReactNode;
  description?: React.ReactNode;
  body?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  /**
   * Optional callback to sync external state.
   * Called when the dialog opening state changes (mainly for closing).
   */
  onOpenChange?: (isOpen: boolean) => void;
  variant?: "basic" | "fullscreen";
  shape?: "full" | "minimal" | "sharp";
  destructive?: boolean;
  contentProps?: Partial<React.ComponentProps<typeof DialogContent>>;
}

interface ActiveDialogInstance {
  id: string;
  name: string;
  props: any;
  isOpen: boolean;
  resolve: (value: any) => void;
}

interface DialogContextType {
  show: (config: DialogConfig) => Promise<boolean>;
  registerDialog: (name: string, component: React.FC<any>) => void;
  openDialog: <T = any>(name: string, props?: T) => Promise<any>;
  close: (id?: string) => void;
  lock: () => void;
  unlock: () => void;
  isLocked: boolean;
}

// --- DEFAULT RENDERER ---
const StandardDialogRenderer = ({
  onClose,
  onSelect,
  ...config
}: DialogConfig & {
  onClose: () => void;
  onSelect: (val: boolean) => void;
}) => {
  const {
    title,
    description,
    body,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    destructive,
    contentProps,
    shape = "minimal",
  } = config;

  const [isLoading, setIsLoading] = useState(false);
  const { lock, unlock, isLocked } = useDialog();

  const handleConfirm = async () => {
    if (onConfirm) {
      const result = onConfirm();
      if (result instanceof Promise) {
        setIsLoading(true);
        lock();
        try {
          await result;
          unlock();
          onSelect(true);
          onClose();
        } catch (error) {
          console.error("Dialog Confirm Error:", error);
          unlock();
          setIsLoading(false);
        }
        return;
      }
    }
    onSelect(true);
    onClose();
  };

  const handleCancel = () => {
    if (isLocked) return;
    onCancel?.();
    onSelect(false);
    onClose();
  };

  return (
    <DialogContent shape={shape} {...contentProps}>
      {(title || description) && (
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
      )}
      {body && (
        <div className="py-4">
          {typeof body === "string" ? (
            <Typography variant="body-medium">{body}</Typography>
          ) : (
            body
          )}
        </div>
      )}
      <DialogFooter>
        <Button
          variant="ghost"
          onClick={handleCancel}
          disabled={isLocked || isLoading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? "destructive" : "primary"}
          onClick={handleConfirm}
          isLoading={isLoading}
          disabled={isLocked && !isLoading}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

// --- CONTEXT ---
const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context)
    throw new Error("useDialog must be used within a DialogProvider");
  return context;
};

// --- PROVIDER ---
export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const registry = useRef<Record<string, React.FC<any>>>({});
  const [stack, setStack] = useState<ActiveDialogInstance[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  const lock = useCallback(() => setIsLocked(true), []);
  const unlock = useCallback(() => setIsLocked(false), []);

  const registerDialog = useCallback(
    (name: string, component: React.FC<any>) => {
      registry.current[name] = component;
    },
    [],
  );

  const close = useCallback(
    (id?: string) => {
      if (isLocked) return;

      setStack((currentStack) => {
        // If an ID is provided, close that specific dialog
        if (id) {
          const target = currentStack.find((s) => s.id === id);
          if (target?.props?.onOpenChange) {
            target.props.onOpenChange(false);
          }
          return currentStack.map((s) =>
            s.id === id ? { ...s, isOpen: false } : s,
          );
        }

        // If no ID provided, close the topmost open dialog
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

  const openDialog = useCallback(
    <T = any,>(name: string, props?: T): Promise<any> => {
      return new Promise((resolve) => {
        const id = crypto.randomUUID();

        // Trigger onOpenChange(true) if provided
        // Use optional chaining for safety
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
    (config: DialogConfig) => {
      return openDialog("standard", config);
    },
    [openDialog],
  );

  // Cleanup closed dialogs after animation
  useEffect(() => {
    const closedDialogs = stack.filter((s) => !s.isOpen);

    if (closedDialogs.length > 0) {
      const timeout = setTimeout(() => {
        setStack((current) => current.filter((s) => s.isOpen));
        closedDialogs.forEach((s) => s.resolve(null));
      }, 400);

      return () => clearTimeout(timeout);
    }
  }, [stack]);

  useEffect(() => {
    registerDialog("standard", StandardDialogRenderer);
  }, [registerDialog]);

  return (
    <DialogContext.Provider
      value={{
        show,
        registerDialog,
        openDialog,
        close,
        lock,
        unlock,
        isLocked,
      }}
    >
      {children}
      {stack.map((instance, index) => {
        const Component = registry.current[instance.name];
        if (!Component) return null;

        const zIndex = 60 + index;
        const isStandard = instance.name === "standard";

        return (
          <Dialog
            key={instance.id}
            open={instance.isOpen}
            isLocked={isLocked}
            onOpenChange={(open) => {
              // Sync external state if provided
              // FIX: Added optional chaining (instance.props?.) to prevent crash if props is undefined
              if (instance.props?.onOpenChange) {
                instance.props.onOpenChange(open);
              }
              // Only trigger close if user manually tried to close (backdrop/esc)
              if (!open && !isLocked) {
                close(instance.id);
              }
            }}
            variant={isStandard ? instance.props?.variant || "basic" : "basic"}
            animation="material3"
          >
            <div style={{ zIndex, position: "relative" }}>
              <Component
                {...instance.props}
                onClose={() => close(instance.id)}
                onSelect={(val: any) => instance.resolve(val)}
              />
            </div>
          </Dialog>
        );
      })}
    </DialogContext.Provider>
  );
};
