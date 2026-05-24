import { Renderer } from "./renderer";
import { Builder } from "./builder";
import { ScriptAndStyleInjector } from "./ScriptAndStyleInjector";
import { defaultActions } from "./defaultActions";

export * from "./types";
export { ScriptAndStyleInjector } from "./ScriptAndStyleInjector";
export { defaultActions } from "./defaultActions";
export { useStudioStore } from "./store"; // <-- Expose the store for external overrides

export const WebsiteStudio = {
  Renderer,
  Builder,
  ScriptAndStyleInjector,
  defaultActions,
};
