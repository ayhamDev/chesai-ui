import { Builder } from './builder'
import { PreviewOverlay } from './builder/PreviewOverlay'
import { defaultActions } from './defaultActions'
import { Renderer } from './renderer'
import { ScriptAndStyleInjector } from './ScriptAndStyleInjector'

export { defaultActions } from './defaultActions'
export * from './registry'
export { ScriptAndStyleInjector } from './ScriptAndStyleInjector'
export { useStudioStore } from './store'
export * from './types'

export const WebsiteStudio = {
  Renderer,
  Builder,
  PreviewOverlay,
  ScriptAndStyleInjector,
  defaultActions,
}
