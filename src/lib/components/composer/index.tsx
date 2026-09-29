'use client'

import React from 'react'
import { useReducedMotion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'

export interface ComposerProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'children' | 'value' | 'defaultValue'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Application-owned controls, kept mounted when the layout changes. */
  startContent?: React.ReactNode
  endContent?: React.ReactNode
  /** Optional previews, context, or extra controls inside the surface. */
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
  layout?: 'auto' | 'inline' | 'stacked'
  /** When auto layout should move controls below the editor. */
  expandOn?: 'multiline' | 'input' | 'focus'
  /** Layout transition duration in milliseconds; reduced motion overrides this. */
  transitionDuration?: number
  /** Show a keyboard focus outline on the surface. Disabled by default. */
  focusOutline?: boolean
  disableHover?: boolean
  /** A roomier editing surface. The caller supplies any expansion control. */
  expanded?: boolean
  minRows?: number
  maxRows?: number
  expandedRows?: number
  variant?: 'filled' | 'filled-inverted' | 'outlined' | 'ghost'
  shape?: 'full' | 'minimal' | 'sharp'
  isInvalid?: boolean
  classNames?: Partial<Record<'input' | 'body' | 'start' | 'end' | 'top' | 'bottom', string>>
}

const surfaces = {
  filled: 'bg-surface-container-highest/60 hover:bg-surface-container-highest',
  'filled-inverted': 'bg-surface-container-lowest hover:bg-filled-inverted-hover',
  outlined: 'bg-surface border-outline-variant',
  ghost: 'bg-transparent',
}

function ComposerContent({ children, className, slot, timing }: {
  children: React.ReactNode; className?: string; slot: string; timing: string
}) {
  const inner = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState(0)
  const visible = children != null && typeof children !== 'boolean'
  React.useLayoutEffect(() => {
    const measure = () => setHeight(visible ? inner.current!.offsetHeight : 0)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(inner.current!)
    return () => observer.disconnect()
  }, [children, visible])
  return <div className="overflow-hidden motion-reduce:transition-none" style={{ height, transition: `height ${timing}` }}>
    <div ref={inner} data-slot={visible ? slot : undefined} className={visible ? className : undefined}>{visible ? children : null}</div>
  </div>
}

/** Text editing and layout only: no built-in send, upload, model, or recording behavior. */
export const Composer = React.forwardRef<HTMLTextAreaElement, ComposerProps>(({
  value: controlledValue, defaultValue = '', onValueChange, onChange,
  startContent, endContent, topContent, bottomContent, layout = 'auto',
  expandOn = 'multiline', transitionDuration = 320, focusOutline = false,
  expanded = false, minRows = 1, maxRows = 6, expandedRows = 12,
  variant = 'filled', shape = 'full', isInvalid = false, disableHover = false,
  className, classNames, style, disabled, readOnly, ...inputProps
}, forwardedRef) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const value = controlledValue ?? internalValue
  const input = React.useRef<HTMLTextAreaElement>(null)
  const body = React.useRef<HTMLDivElement>(null)
  const start = React.useRef<HTMLDivElement>(null)
  const end = React.useRef<HTMLDivElement>(null)
  const [sizing, setSizing] = React.useState({ height: 40, scrollable: false, stacked: layout === 'stacked' || expanded, crowded: false, startWidth: 0, endWidth: 0, startHeight: 0, endHeight: 0 })
  const reducedMotion = useReducedMotion()
  const [focused, setFocused] = React.useState(false)
  const pointerDown = React.useRef(false)
  const pendingBlur = React.useRef(false)
  React.useImperativeHandle(forwardedRef, () => input.current!)

  React.useEffect(() => {
    const doc = input.current!.ownerDocument
    let timer: ReturnType<typeof setTimeout> | undefined
    const down = () => { pointerDown.current = true }
    const up = () => {
      pointerDown.current = false
      // Let the outside target receive its click before collapsing moves it.
      timer = setTimeout(() => {
        if (pendingBlur.current) { pendingBlur.current = false; setFocused(false) }
      }, 0)
    }
    doc.addEventListener('pointerdown', down, true)
    doc.addEventListener('pointerup', up, true)
    doc.addEventListener('pointercancel', up, true)
    return () => {
      clearTimeout(timer)
      doc.removeEventListener('pointerdown', down, true)
      doc.removeEventListener('pointerup', up, true)
      doc.removeEventListener('pointercancel', up, true)
    }
  }, [])

  React.useLayoutEffect(() => {
    const field = input.current!
    const container = body.current!
    let measuredGeometry = ''
    const measure = () => {
      const available = container.clientWidth
      if (!available) return
      const startWidth = start.current?.scrollWidth ?? 0
      const endWidth = end.current?.scrollWidth ?? 0
      const startHeight = start.current?.offsetHeight ?? 0
      const endHeight = end.current?.offsetHeight ?? 0
      const geometry = [available, startWidth, endWidth, startHeight, endHeight].join(':')
      if (geometry === measuredGeometry) return
      measuredGeometry = geometry
      const controls = startWidth + endWidth
      const compactWidth = Math.max(1, available - controls - 16)
      const css = getComputedStyle(field)
      const line = Number.parseFloat(css.lineHeight) || 24
      const padding = (Number.parseFloat(css.paddingTop) || 0) + (Number.parseFloat(css.paddingBottom) || 0)
      // Measure an invisible copy so reading content never interrupts the live
      // editor's CSS transition, caret, scroll position, or text selection.
      const probe = field.cloneNode() as HTMLTextAreaElement
      probe.removeAttribute('id')
      probe.removeAttribute('name')
      probe.removeAttribute('data-slot')
      probe.setAttribute('aria-hidden', 'true')
      probe.tabIndex = -1
      probe.value = field.value
      Object.assign(probe.style, { position: 'absolute', visibility: 'hidden', pointerEvents: 'none', height: '0px', transition: 'none' })
      container.appendChild(probe)
      // Always measure at compact width first, preventing wrap/unwrap oscillation
      // when a stacked editor gains the space previously occupied by controls.
      probe.style.width = `${compactWidth}px`
      const wraps = probe.scrollHeight > line + padding + 1
      const crowded = controls + 8 > available
      const triggered = expandOn === 'input' ? value.length > 0 : expandOn === 'focus' && focused
      const stacked = expanded || layout === 'stacked' || (layout === 'auto' && (wraps || compactWidth < 80 || minRows > 1 || triggered))
      probe.style.width = `${stacked ? available : compactWidth}px`
      const minimum = Math.max(1, expanded ? expandedRows : minRows)
      const maximum = Math.max(minimum, expanded ? expandedRows : maxRows)
      const height = Math.min(Math.max(probe.scrollHeight, minimum * line + padding), maximum * line + padding)
      const scrollable = probe.scrollHeight > maximum * line + padding + 1
      probe.remove()
      const next = { height, scrollable, stacked, crowded, startWidth, endWidth, startHeight, endHeight }
      setSizing(old => Object.keys(next).every(key => old[key as keyof typeof old] === next[key as keyof typeof next]) ? old : next)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    if (start.current) observer.observe(start.current)
    if (end.current) observer.observe(end.current)
    return () => observer.disconnect()
  }, [value, layout, expanded, minRows, maxRows, expandedRows, startContent, endContent, expandOn, focused])

  React.useEffect(() => {
    const form = input.current?.form
    if (!form || controlledValue !== undefined) return
    const reset = (event: Event) => queueMicrotask(() => {
      if (!event.defaultPrevented) setInternalValue(defaultValue)
    })
    form.addEventListener('reset', reset)
    return () => form.removeEventListener('reset', reset)
  }, [controlledValue, defaultValue, inputProps.form])

  const timing = `${reducedMotion ? 0 : Math.max(0, transitionDuration)}ms cubic-bezier(0.22, 1, 0.36, 1)`
  const { stacked, crowded } = sizing
  const controlHeight = crowded ? sizing.startHeight + sizing.endHeight + 4 : Math.max(sizing.startHeight, sizing.endHeight)
  const bodyHeight = stacked ? sizing.height + (controlHeight ? controlHeight + 4 : 0) : Math.max(sizing.height, controlHeight)
  return (
    <div style={style} data-disable-hover={disableHover || undefined}
      onFocusCapture={() => { pendingBlur.current = false; setFocused(true) }}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          pendingBlur.current = true
          if (!pointerDown.current) { pendingBlur.current = false; setFocused(false) }
        }
      }}
      data-composer="" data-layout={stacked ? 'stacked' : 'inline'} data-expanded={expanded} data-disabled={disabled}
      className={twMerge('relative w-full min-w-0 border border-transparent p-2 text-on-surface transition-colors duration-200 motion-reduce:transition-none',
        focusOutline && 'has-[textarea:focus-visible]:ring-2 has-[textarea:focus-visible]:ring-primary/40',
        surfaces[variant], shape === 'sharp' ? 'rounded-none' : shape === 'minimal' ? 'rounded-2xl' : 'rounded-[28px]',
        disabled && 'opacity-disabled', isInvalid && 'border-error', className)}>
      <ComposerContent slot="composer-top" timing={timing} className={twMerge('min-w-0 px-2 pb-2', classNames?.top)}>{topContent}</ComposerContent>
      <div ref={body} data-slot="composer-body" className={twMerge('relative min-w-0 motion-reduce:transition-none', classNames?.body)}
        style={{ height: bodyHeight, transition: `height ${timing}` }}>
        <div ref={start} data-slot="composer-start"
          className={twMerge('absolute start-0 bottom-0 flex w-fit max-w-full min-w-0 flex-wrap items-center gap-1 motion-reduce:transition-none', classNames?.start)}
          style={{ transform: stacked && crowded ? `translateY(-${sizing.endHeight + 4}px)` : 'translateY(0)', transition: `transform ${timing}` }}>
          {startContent}
        </div>
        <div className="min-w-0 motion-reduce:transition-none"
          style={{ marginInlineStart: stacked ? 0 : sizing.startWidth + 8, width: stacked ? '100%' : `calc(100% - ${sizing.startWidth + sizing.endWidth + 16}px)`, transition: `width ${timing}, margin-inline-start ${timing}` }}>
          <textarea {...inputProps} ref={input} value={value} disabled={disabled} readOnly={readOnly}
            aria-invalid={isInvalid || inputProps['aria-invalid']} data-slot="composer-input"
            rows={Math.max(1, minRows)}
            className={twMerge('block w-full min-w-0 resize-none border-0 bg-transparent px-2 py-2 text-base leading-6 text-on-surface outline-none placeholder:text-on-surface-variant/60 motion-reduce:transition-none', classNames?.input)}
            style={{ height: sizing.height, overflowY: sizing.scrollable ? 'auto' : 'hidden', transition: `height ${timing}` }}
            onChange={event => {
              if (controlledValue === undefined) setInternalValue(event.target.value)
              onValueChange?.(event.target.value)
              onChange?.(event)
            }} />
        </div>
        <div ref={end} data-slot="composer-end"
          className={twMerge('absolute end-0 bottom-0 flex w-fit max-w-full min-w-0 flex-wrap items-center justify-end gap-1', classNames?.end)}>
          {endContent}
        </div>
      </div>
      <ComposerContent slot="composer-bottom" timing={timing} className={twMerge('min-w-0 px-2 pt-2', classNames?.bottom)}>{bottomContent}</ComposerContent>
    </div>
  )
})
Composer.displayName = 'Composer'
