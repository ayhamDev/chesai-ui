import React, { useEffect } from "react";

interface ScriptAndStyleInjectorProps {
  /** The raw HTML string containing elements like scripts, styles, or meta tags */
  html?: string;
  /** Where to append the extracted tags inside the document */
  target: "head" | "body";
}

/**
 * Safely parses and injects custom head or body scripts/styles inside the client environment.
 * Handles cleanup of script/style side-effects when transitioning routes or unmounting.
 */
export const ScriptAndStyleInjector: React.FC<ScriptAndStyleInjectorProps> = ({
  html,
  target,
}) => {
  useEffect(() => {
    if (!html || typeof window === "undefined") return;

    // Use a temporary container to parse the raw HTML structure securely
    const container = document.createElement("div");
    container.innerHTML = html.trim();

    const targetElement = target === "head" ? document.head : document.body;
    const injectedNodes: Node[] = [];

    Array.from(container.childNodes).forEach((node) => {
      if (node instanceof HTMLScriptElement) {
        // Recreate the script element and map its attributes to trigger execution.
        const scriptElement = document.createElement("script");

        Array.from(node.attributes).forEach((attr) => {
          scriptElement.setAttribute(attr.name, attr.value);
        });

        if (node.src) {
          scriptElement.src = node.src;
        } else {
          scriptElement.textContent = node.textContent;
        }

        targetElement.appendChild(scriptElement);
        injectedNodes.push(scriptElement);
      } else {
        // Clone and inject styles, links, and non-script nodes
        const clonedNode = node.cloneNode(true);
        targetElement.appendChild(clonedNode);
        injectedNodes.push(clonedNode);
      }
    });

    // Cleanup injected tags when unmounting or switching pages
    return () => {
      injectedNodes.forEach((node) => {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      });
    };
  }, [html, target]);

  return null;
};
