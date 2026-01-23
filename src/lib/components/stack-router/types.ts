import type { Transition, Variants } from 'framer-motion'
import type { ForwardedRef } from 'react'
import type { AppBarProps } from '../appbar'
import type { TransitionPresets } from './transitions'

export interface StackScreenOptions {
  title?: string
  headerTitle?: string | ((props: {}) => React.ReactNode)
  headerShown?: boolean
  headerLeft?: (props: { canGoBack: boolean }) => React.ReactNode
  headerRight?: (props: { canGoBack: boolean }) => React.ReactNode
  headerStyle?: {
    backgroundColor?: 'background' | 'card' | 'primary' | 'secondary'
  }
  appBarProps?: Partial<AppBarProps>
  animation?: TransitionPresets | StackAnimation
}

export interface StackScreenProps<T extends Record<string, object | undefined>, R extends keyof T> {
  navigation: NavigationProp<T>
  route: RouteProp<T, R>
}

export interface StackScreenComponent<T extends Record<string, object | undefined>, R extends keyof T> {
  (props: StackScreenProps<T, R>): React.ReactNode
  props: {
    name: R
    component: (props: StackScreenProps<T, R>) => React.ReactNode
    options?: StackScreenOptions | ((props: { route: RouteProp<T, R> }) => StackScreenOptions)
  }
}

export interface StackNavigationState<T extends Record<string, object | undefined>> {
  index: number
  routes: Route<T, keyof T>[]
}

export interface Route<T extends Record<string, object | undefined>, R extends keyof T> {
  key: string
  name: R
  params: T[R]
}

export type RouteProp<T extends Record<string, object | undefined>, R extends keyof T> = Route<T, R>

export type NavigationEvent = 'transitionStart' | 'transitionEnd'
export type NavigationEventCallback = (event: { data: { closing: boolean } }) => void

export interface NavigationProp<T extends Record<string, object | undefined>> {
  navigate: <R extends keyof T>(name: R, params: T[R]) => void
  push: <R extends keyof T>(name: R, params: T[R]) => void
  replace: <R extends keyof T>(name: R, params: T[R]) => void
  goBack: () => void
  pop: (count?: number) => void
  popToTop: () => void
  canGoBack: () => boolean
  addListener: (event: NavigationEvent, callback: NavigationEventCallback) => () => void
  removeListener: (event: NavigationEvent, callback: NavigationEventCallback) => void
  scrollContainerRef: ForwardedRef<any | null>
}

// --- MODIFIED: The top-level `transition` is now optional ---
export interface StackAnimation {
  transition?: Transition
  variants: Variants
}
