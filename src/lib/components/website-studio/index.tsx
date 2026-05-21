import { Renderer } from "./renderer";
import { Builder } from "./builder";
import { ScriptAndStyleInjector } from "./ScriptAndStyleInjector";
import { defaultActions } from "./defaultActions";

export * from "./types";
export { ScriptAndStyleInjector } from "./ScriptAndStyleInjector";
export { defaultActions } from "./defaultActions";

export const WebsiteStudio = {
  Renderer,
  Builder,
  ScriptAndStyleInjector,
  defaultActions,
};
