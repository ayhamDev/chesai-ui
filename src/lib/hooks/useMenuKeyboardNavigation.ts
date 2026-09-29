"use client";

import { useSyncExternalStore } from "react";

let keyboard = false;
const listeners = new Set<() => void>();
const navigationKeys = new Set([
  "Tab",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "Enter",
  " ",
]);
function setKeyboard(value: boolean) {
  if (keyboard === value) return;
  keyboard = value;
  for (const listener of listeners) listener();
}
const onPointer = () => setKeyboard(false);
const onKey = (event: KeyboardEvent) => {
  if (
    !event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    (navigationKeys.has(event.key) || event.key.length === 1)
  )
    setKeyboard(true);
};
function subscribe(listener: () => void) {
  if (!listeners.size) {
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("pointermove", onPointer, true);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("pointermove", onPointer, true);
      keyboard = false;
    }
  };
}

/** Menus focus items on hover, so :focus-visible alone cannot identify keyboard navigation. */
export function useMenuKeyboardNavigation() {
  return useSyncExternalStore(
    subscribe,
    () => keyboard,
    () => false,
  );
}
