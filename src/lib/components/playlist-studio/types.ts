// src/lib/components/playlist-studio/types.ts
import type React from 'react'
import type { MotionValue } from 'framer-motion'

// 20 Distinct Transition Types for Signage Engine
export type TransitionType = 
  | 'none'
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up-left'
  | 'slide-up-right'
  | 'slide-down-left'
  | 'slide-down-right'
  | 'scale-up'
  | 'scale-down'
  | 'zoom-in'
  | 'zoom-out'
  | 'flip-x'
  | 'flip-y'
  | 'spin-cw'
  | 'spin-ccw'
  | 'blur'
  | 'blur-scale'

export interface TransitionConfig {
  type: TransitionType
  duration: number
}

export interface PlaylistItemLayout {
  x: number | string
  y: number | string
  width: number | string
  height: number | string
  rotation?: number
  opacity?: number
  zIndex?: number
  style?: React.CSSProperties 
}

export interface PlaylistItem {
  id: string
  type: 'Image' | 'Video' | string
  name?: string
  startTime: number
  duration: number
  layout: PlaylistItemLayout
  props: Record<string, any>
  transitions?: {
    in?: TransitionConfig
    out?: TransitionConfig
  }
}

export interface PlaylistLayer {
  id: string
  name: string
  items: PlaylistItem[]
}

export interface PlaylistSettings {
  width: number
  height: number
  loop: boolean
  backgroundColor: string
}

export interface PlaylistSchema {
  id: string
  version: string
  settings: PlaylistSettings
  layers: PlaylistLayer[]
}

export interface PlaylistComponentProps {
  id?: string
  data: Record<string, any>
  playhead: MotionValue<number>
  isActive: boolean
  startTime: number
  endTime: number
  isTimelinePlaying: boolean
  isSeeking?: boolean
}

export interface PlaylistComponentRegistry {
  [key: string]: React.FC<PlaylistComponentProps>
}
