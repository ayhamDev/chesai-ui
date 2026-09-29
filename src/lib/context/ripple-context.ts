'use client'

import { createContext } from 'react'
import { defaultRippleSettings } from '../utils/ripple-settings'

// Keep component ripples independent of palette generation and font loading.
export const RippleContext = createContext(defaultRippleSettings)
