'use client'

import React from 'react'
import { twMerge } from 'tailwind-merge'
import { useDirection } from '../../context/direction'
import type { ChipAppearance } from './chip-styles'

export type ChipGroupGap = 'none' | 'xs' | 'sm' | 'md' | 'lg'
const gaps = { none: 'gap-0', xs: 'gap-px', sm: 'gap-0.5', md: 'gap-1', lg: 'gap-2' }

interface GroupBase
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'color'>,
    ChipAppearance {
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  loop?: boolean
  gap?: ChipGroupGap
  /** Keep each chip individually shaped instead of sharing group end caps. */
  separated?: boolean
  activeShape?: ChipAppearance['shape']
}
export type ChipGroupProps = GroupBase &
  (
    | { type?: 'none'; value?: never; defaultValue?: never; onValueChange?: never; allowDeselect?: never }
    | {
        type: 'single'
        value?: string
        defaultValue?: string
        onValueChange?: (value: string) => void
        allowDeselect?: boolean
      }
    | {
        type: 'multiple'
        value?: string[]
        defaultValue?: string[]
        onValueChange?: (value: string[]) => void
        allowDeselect?: never
      }
  )
interface GroupContext extends ChipAppearance {
  type: 'none' | 'single' | 'multiple'
  disabled: boolean
  selected: string[]
  toggle: (value: string) => void
}
export const ChipGroupContext = React.createContext<GroupContext | null>(null)

/** Layout and shared appearance for any chips. Selection management is optional. */
export const ChipGroup = React.forwardRef<HTMLDivElement, ChipGroupProps>(
  (
    {
      type = 'none',
      value,
      defaultValue,
      onValueChange,
      allowDeselect = true,
      disabled = false,
      orientation = 'horizontal',
      loop = true,
      dir,
      gap: gapProp,
      separated = false,
      activeShape,
      variant,
      color,
      size,
      shape = 'full',
      showCheck,
      children,
      className,
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState<string | string[]>(defaultValue ?? (type === 'multiple' ? [] : ''))
    const current = value ?? internal
    const selected = Array.isArray(current) ? current : current ? [current] : []
    const root = React.useRef<HTMLDivElement>(null)
    React.useImperativeHandle(ref, () => root.current!)
    const direction = useDirection(root, dir)
    const gap = gapProp ?? (separated ? 'lg' : 'none')
    const commit = (next: string | string[]) => {
      if (disabled || type === 'none') return
      if (value === undefined) setInternal(next)
      if (type === 'multiple') (onValueChange as ((value: string[]) => void) | undefined)?.(next as string[])
      else (onValueChange as ((value: string) => void) | undefined)?.(next as string)
    }
    const toggle = (item: string) => {
      if (type === 'multiple') commit(selected.includes(item) ? selected.filter(v => v !== item) : [...selected, item])
      else if (!selected.includes(item)) commit(item)
      else if (allowDeselect) commit('')
    }
    const outer = shape === 'full' ? '24px' : shape === 'minimal' ? '12px' : '0px'
    const rounding = !separated
      ? ({
          '--chip-group-outer': outer,
          '--chip-group-inner': gap === 'none' || shape === 'sharp' ? '0px' : '6px',
        } as React.CSSProperties)
      : undefined
    return (
      <ChipGroupContext.Provider
        value={{
          type,
          selected,
          disabled,
          toggle,

          variant,
          color,
          size,
          shape,
          showCheck,
        }}
      >
        <div
          {...rest}
          ref={root}
          dir={dir}
          role="group"
          aria-disabled={disabled || undefined}
          data-chip-group=""
          data-gap={gap}
          data-separated={separated}
          style={{ ...rounding, ...rest.style }}
          className={twMerge(
            'inline-flex max-w-full gap-2 p-1',
            gaps[gap],
            orientation === 'vertical'
              ? 'flex-col items-stretch'
              : separated
                ? 'flex-wrap items-center'
                : 'items-center overflow-x-auto',
            !separated && '[&>[data-chip-item]]:rounded-[var(--chip-group-inner)]',
            !separated &&
              (orientation === 'vertical'
                ? '[&>[data-chip-item]:first-child]:rounded-t-[var(--chip-group-outer)] [&>[data-chip-item]:last-child]:rounded-b-[var(--chip-group-outer)]'
                : '[&>[data-chip-item]:first-child]:rounded-s-[var(--chip-group-outer)] [&>[data-chip-item]:last-child]:rounded-e-[var(--chip-group-outer)]'),
            !separated &&
              gap === 'none' &&
              (!variant || variant === 'outlined') &&
              (orientation === 'vertical'
                ? '[&>[data-chip-item]:not(:first-child)]:-mt-px'
                : '[&>[data-chip-item]:not(:first-child)]:-ms-px'),
            shape !== 'sharp' && activeShape === 'full' && '[&>[data-chip-item][data-selected=true]]:rounded-[24px]!',
            shape !== 'sharp' && activeShape === 'minimal' && '[&>[data-chip-item][data-selected=true]]:rounded-xl!',
            activeShape === 'sharp' && '[&>[data-chip-item][data-selected=true]]:rounded-none!',
            className,
          )}
          onKeyDown={event => {
            onKeyDown?.(event)
            if (event.defaultPrevented || disabled || event.altKey || event.ctrlKey || event.metaKey) return
            const target = event.target as HTMLElement
            if (!target.matches('button[data-chip]') || target.closest('[data-chip-group]') !== root.current) return
            const buttons = Array.from(root.current!.querySelectorAll<HTMLButtonElement>('button[data-chip]')).filter(
              item => !item.disabled && item.closest('[data-chip-group]') === root.current,
            )
            let next = buttons.indexOf(target as HTMLButtonElement)
            const forward = orientation === 'vertical' ? 'ArrowDown' : direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
            const back = orientation === 'vertical' ? 'ArrowUp' : direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
            if (event.key === 'Home') next = 0
            else if (event.key === 'End') next = buttons.length - 1
            else if (event.key === forward) next++
            else if (event.key === back) next--
            else return
            event.preventDefault()
            if (buttons.length)
              buttons[
                loop ? (next + buttons.length) % buttons.length : Math.max(0, Math.min(buttons.length - 1, next))
              ].focus()
          }}
        >
          {children}
        </div>
      </ChipGroupContext.Provider>
    )
  },
)
ChipGroup.displayName = 'ChipGroup'
