import { useEffect } from "react";

export function useGlobalViewTransitions() {
  useEffect(() => {
    const nav = (window as any).navigation;
    const startViewTransition = (document as any).startViewTransition;
    if (!nav || !startViewTransition) return;

    const handleNavigate = (event: any) => {
      if (!event.canIntercept) return;

      event.intercept({
        handler: async () => {
          return new Promise<void>((resolve) => {
            startViewTransition(() => {
              resolve();
            });
          });
        },
      });
    };

    nav.addEventListener("navigate", handleNavigate);
    return () => nav.removeEventListener("navigate", handleNavigate);
  }, []);
}
