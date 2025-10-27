import { App } from "@capacitor/app";
import type { PluginListenerHandle } from "@capacitor/core";
import { useEffect } from "react";

/**
 * A self-contained React hook that handles the hardware back button in a
 * Capacitor app, integrating it seamlessly with any router that uses the
 * standard browser History API (like chesai-ui's StackRouter).
 */
export const useCapacitorBackButton = () => {
  useEffect(() => {
    let listenerHandle: PluginListenerHandle | null = null;

    const registerListener = async () => {
      listenerHandle = await App.addListener("backButton", (event) => {
        console.log("event");

        // event.canGoBack is a boolean provided by Capacitor, indicating
        // if the webview's history has pages to go back to.
        if (event.canGoBack) {
          // If there's history, go back in the webview.
          // This will be handled by the stack router.
          window.history.back();
        } else {
          // If there's no history, exit the app.
          App.exitApp();
        }
      });
    };

    // Register the listener when the component mounts.
    registerListener();

    // Clean up the listener when the component unmounts.
    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, []); // The empty dependency array ensures this runs only once.
};
