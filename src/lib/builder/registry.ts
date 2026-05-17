import React from 'react'
import { Button } from '../components/button'
import { Card } from '../components/card'
import { Image } from '../components/image'
import { Typography } from '../components/typography'

// A generic Container component for layout
const Container = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, style, ...props }, ref) => (
    <div ref={ref} className={className} style={style} {...props}>
      {children}
    </div>
  )
)
Container.displayName = 'Container'

// The mapping of string types from JSON to actual React Components
export const COMPONENT_REGISTRY: Record<string, React.ElementType> = {
  Container: Container,
  Button: Button,
  Typography: Typography,
  Card: Card,
  Image: Image,
}
