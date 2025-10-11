import type { AppBarSharedProps } from '../appbar'
import type { StackAnimation } from './transitions'

// --- Event & Listener Types ---
export type NavigationEvent = 'transitionStart' | 'transitionEnd'
export type NavigationEventCallback = (event: { data: { closing: boolean } }) => void

// --- Navigation & Route Prop Types ---
export interface NavigationProp<T extends Record<string, object | undefined>> {
  navigate: <R extends keyof T>(name: R, params: T[R] extends undefined ? never : T[R]) => void
  push: <R extends keyof T>(name: R, params: T[R] extends undefined ? never : T[R]) => void
  replace: <R extends keyof T>(name: R, params: T[R] extends undefined ? never : T[R]) => void
  goBack: () => void
  pop: (count?: number) => void
  popToTop: () => void
  canGoBack: () => boolean
  addListener: (event: NavigationEvent, callback: NavigationEventCallback) => () => void
  removeListener: (event: NavigationEvent, callback: NavigationEventCallback) => void
  scrollContainerRef: React.RefObject<any | null>
}

export interface Route<T, R extends keyof T> {
  key: string
  name: R
  params: T[R]
}

export type RouteProp<T extends Record<string, object | undefined>, R extends keyof T> = Route<T, R>

// --- State & Screen Types ---
export interface StackNavigationState<T extends Record<string, object | undefined>> {
  index: number
  routes: Route<T, keyof T>[]
}

/** Pre-defined animation presets for screen transitions. */
export type AnimationPreset = 'default' | 'slide-from-bottom' | 'fade' | 'none'

export interface StackScreenOptions {
  title?: string | ((props: object) => React.ReactNode)
  headerTitle?: string | ((props: object) => React.ReactNode)
  headerShown?: boolean
  headerLeft?: (props: { canGoBack: boolean }) => React.ReactNode
  headerRight?: (props: { canGoBack: boolean }) => React.ReactNode
  headerStyle?: {
    backgroundColor?: 'background' | 'card' | 'primary' | 'secondary'
  }
  appBarProps?: AppBarSharedProps
  /**
   * The animation to use for screen transitions.
   * Can be a pre-defined preset string or a custom animation object.
   */
  animation?: AnimationPreset | StackAnimation
}

export interface StackScreenProps<T extends Record<string, object | undefined>, R extends keyof T> {
  name: R
  component: React.ComponentType<{
    navigation: NavigationProp<T>
    route: RouteProp<T, R>
  }>
  options?: StackScreenOptions | ((props: { route: RouteProp<T, R> }) => StackScreenOptions)
}

export type StackScreenComponent<T extends Record<string, object | undefined>, R extends keyof T> = React.FC<
  StackScreenProps<T, R>
>
