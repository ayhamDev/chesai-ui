'use client'

import React from 'react'
import { Check } from 'lucide-react'

import { twMerge } from 'tailwind-merge'
import useRipple from '../../hooks/useRipple'
import { chipVariants, type ChipAppearance } from './chip-styles'
import { ChipGroupContext } from './chip-group'

export { ChipGroup, type ChipGroupProps, type ChipGroupGap } from './chip-group'
export type { ChipAppearance } from './chip-styles'

export interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>, ChipAppearance {
  /** Action chips can show a selected appearance without toggling, for custom actions or composed triggers. */
  behavior?: 'toggle' | 'action'
  selected?: boolean
  defaultSelected?: boolean
  onSelectedChange?: (selected: boolean) => void
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      className,
      selected: selectedProp,
      defaultSelected,
      onSelectedChange,
      children,
      disabled: disabledProp,
      startIcon,
      endIcon,
      variant: variantProp,
      color: colorProp,
      size: sizeProp,
      shape: shapeProp,
      showCheck: showCheckProp,
      value,
      onClick,
      onPointerDown,
      onFocus,
      style,
      type = 'button',
      tabIndex,
      behavior = 'toggle',
      ...props
    },
    ref,
  ) => {
    const group = React.useContext(ChipGroupContext)
    const grouped = group !== null && group.type !== 'none' && typeof value === 'string' && behavior === 'toggle'
    const [internalSelected, setInternalSelected] = React.useState(defaultSelected ?? false)
    const selected = grouped ? group.selected.includes(value as string) : (selectedProp ?? internalSelected)
    const selectable =
      behavior === 'toggle' &&
      (grouped || selectedProp !== undefined || defaultSelected !== undefined || !!onSelectedChange)
    const disabled = disabledProp || group?.disabled || false
    const variant = variantProp ?? group?.variant ?? 'outlined'
    const color = colorProp ?? group?.color ?? 'secondary'
    const size = sizeProp ?? group?.size ?? 'md'
    const shape = shapeProp ?? group?.shape ?? 'full'
    const showCheck = showCheckProp ?? group?.showCheck ?? !startIcon
    const localRef = React.useRef<HTMLButtonElement>(null)
    React.useImperativeHandle(ref, () => localRef.current!)

    const [, ripple] = useRipple({ ref: localRef, color: 'currentColor', disabled })
    const neutral = color === 'neutral'
    const colors = {
      '--chip-accent': `var(--md-sys-color-${neutral ? 'inverse-surface' : color})`,
      '--chip-on-accent': `var(--md-sys-color-${neutral ? 'inverse-on-surface' : `on-${color}`})`,
      '--chip-container': `var(--md-sys-color-${neutral ? 'surface-container-highest' : `${color}-container`})`,
      '--chip-on-container': `var(--md-sys-color-${neutral ? 'on-surface' : `on-${color}-container`})`,
    } as React.CSSProperties

    return (
      <button
        {...props}
        type={type}
        ref={localRef}
        value={value}
        disabled={disabled}
        role={props.role}
        aria-pressed={selectable ? selected : props['aria-pressed']}
        data-chip=""
        data-chip-item=""
        data-selected={selected}
        data-chip-value={grouped ? value : undefined}
        tabIndex={tabIndex}
        style={{ ...colors, ...style }}
        className={twMerge(chipVariants({ variant, size, shape }), className)}
        onPointerDown={event => {
          onPointerDown?.(event)
          if (!event.defaultPrevented) ripple(event)
        }}
        onFocus={event => {
          onFocus?.(event)
        }}
        onClick={event => {
          onClick?.(event)
          if (event.defaultPrevented || disabled || !selectable) return
          if (grouped) group.toggle(value as string)
          else {
            if (selectedProp === undefined) setInternalSelected(!selected)
            onSelectedChange?.(!selected)
          }
        }}
      >
        <span className="relative z-10 inline-flex items-center justify-center">
          {showCheck && selectable && (
            <span
              aria-hidden="true"
              className="grid transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{ gridTemplateColumns: selected ? '1fr' : '0fr' }}
            >
              <span className="min-w-0 overflow-hidden">
                <span className="flex pe-2">
                  <Check
                    className="h-4 w-4 shrink-0 transition-transform duration-300 motion-reduce:transition-none"
                    style={{ transform: selected ? 'scale(1)' : 'scale(0.5)' }}
                  />
                </span>
              </span>
            </span>
          )}
          {startIcon && (
            <span aria-hidden="true" className="me-2 inline-flex shrink-0 items-center">
              {startIcon}
            </span>
          )}
          {children}
          {endIcon && (
            <span aria-hidden="true" className="ms-2 inline-flex shrink-0 items-center">
              {endIcon}
            </span>
          )}
        </span>
      </button>
    )
  },
)
Chip.displayName = 'Chip'
