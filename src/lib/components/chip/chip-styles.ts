import { cva } from 'class-variance-authority'

export interface ChipAppearance {
  variant?: 'outlined' | 'filled' | 'tonal' | 'soft' | 'ghost'
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  shape?: 'full' | 'minimal' | 'sharp'
  /** Animate a checkmark into the selected chip. Defaults to true when there is no start icon. */
  showCheck?: boolean
}

export const chipVariants = cva(
  'relative isolate inline-flex shrink-0 items-center justify-center border font-semibold outline-none overflow-hidden cursor-pointer select-none transition-[background-color,border-color,border-radius,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100',
  {
    variants: {
      variant: {
        outlined:
          'bg-transparent text-on-surface-variant border-outline hover:bg-on-surface/5 data-[selected=true]:bg-[var(--chip-container)] data-[selected=true]:text-[var(--chip-on-container)] data-[selected=true]:border-transparent data-[selected=true]:hover:brightness-95',
        filled:
          'bg-surface-container-highest text-on-surface border-transparent hover:bg-surface-container-high data-[selected=true]:bg-[var(--chip-accent)] data-[selected=true]:text-[var(--chip-on-accent)] data-[selected=true]:hover:brightness-95',
        tonal:
          'bg-[var(--chip-container)] text-[var(--chip-on-container)] border-transparent hover:brightness-95 data-[selected=true]:bg-[var(--chip-accent)] data-[selected=true]:text-[var(--chip-on-accent)]',
        soft: 'bg-surface-container-lowest text-on-surface-variant border-transparent hover:bg-filled-inverted-hover data-[selected=true]:bg-[var(--chip-container)] data-[selected=true]:text-[var(--chip-on-container)] data-[selected=true]:border-[var(--chip-accent)]',
        ghost:
          'bg-transparent text-on-surface-variant border-transparent hover:bg-on-surface/5 data-[selected=true]:bg-[var(--chip-container)] data-[selected=true]:text-[var(--chip-on-container)]',
      },
      size: { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm', lg: 'h-12 px-5 text-base' },
      shape: { full: 'rounded-full', minimal: 'rounded-lg', sharp: 'rounded-none' },
    },
    defaultVariants: { variant: 'outlined', size: 'md', shape: 'full' },
  },
)
