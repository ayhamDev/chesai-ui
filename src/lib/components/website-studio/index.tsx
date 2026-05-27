import { Renderer } from "./renderer";
import { Builder } from "./builder";
import { ScriptAndStyleInjector } from "./ScriptAndStyleInjector";
import { defaultActions } from "./defaultActions";
import { PreviewOverlay } from "./builder/PreviewOverlay";

export * from "./types";
export { ScriptAndStyleInjector } from "./ScriptAndStyleInjector";
export { defaultActions } from "./defaultActions";
export { useStudioStore } from "./store";

export const WebsiteStudio = {
  Renderer,
  Builder,
  PreviewOverlay,
  ScriptAndStyleInjector,
  defaultActions,
};
