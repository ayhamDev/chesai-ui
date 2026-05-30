import React, { useEffect, useRef } from "react";

interface ScriptAndStyleInjectorProps {
  /** The raw HTML string containing elements like scripts, styles, or meta tags */
  html?: string;
  /** Where to append the extracted tags inside the document */
  target: "head" | "body";
}

/**
 * Safely parses and injects custom head or body scripts/styles inside the client environment.
 * Automatically scopes injections to the document it mounts in (crucial for iframe isolation).
 */
export const ScriptAndStyleInjector: React.FC<ScriptAndStyleInjectorProps> = ({
  html,
  target,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!html || !mountRef.current) return;

    // Securely retrieve the document context this component is mounted inside (e.g. an iframe)
    const doc = mountRef.current.ownerDocument;
    if (!doc) return;

    const targetElement = target === "head" ? doc.head : doc.body;
    const container = doc.createElement("div");
    container.innerHTML = html.trim();

    const injectedNodes: Node[] = [];

    Array.from(container.childNodes).forEach((node) => {
      if (node instanceof HTMLScriptElement) {
        // Recreate the script element to trigger execution
        const scriptElement = doc.createElement("script");

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

  return <div ref={mountRef} style={{ display: "none" }} data-injector-target={target} />;
};
