import { useEffect } from "react";

export function useGlobalViewTransitions() {
  useEffect(() => {
    // Ensure the browser supports both Navigation API and View Transitions
    if (!window.navigation || !document.startViewTransition) return;

    const handleNavigate = (event: NavigateEvent) => {
      // Ignore cross-document navigations (e.g., external links)
      if (!event.canIntercept) return;

      event.intercept({
        handler: async () => {
          return new Promise<void>((resolve) => {
            document?.startViewTransition(() => {
              // The router updates the DOM asynchronously.
              // Resolving the promise allows the view transition to proceed.
              resolve();
            });
          });
        },
      });
    };

    window.navigation.addEventListener("navigate", handleNavigate);
    return () =>
      window.navigation.removeEventListener("navigate", handleNavigate);
  }, []);
}
