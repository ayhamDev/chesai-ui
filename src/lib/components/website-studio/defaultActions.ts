/**
 * A standard, safe library of built-in actions that work universally
 * within the Renderer engine runtime context.
 */
export const defaultActions: Record<string, Function> = {
  /**
   * Safely opens a target URL or anchors on the page.
   */
  openLink: (url: string, target: string = '_self') => {
    if (typeof window === 'undefined') return

    // Simple verification check to avoid javascript protocol injection vectors
    if (url.toLowerCase().startsWith('javascript:')) {
      console.warn('[WebsiteStudio] Blocked execution of dynamic javascript protocol url.')
      return
    }

    window.open(url, target)
  },

  /**
   * Performs a smooth hardware-accelerated scroll transition to a target selector.
   */
  scrollTo: (selector: string, behavior: 'smooth' | 'auto' = 'smooth') => {
    if (typeof window === 'undefined') return
    const targetElement = document.querySelector(selector)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior })
    }
  },

  /**
   * Toggles standard semantic element visibilities by alternating a custom CSS class.
   */
  toggleVisibility: (elementId: string, classNameToToggle: string = 'hidden') => {
    if (typeof window === 'undefined') return
    const element = document.getElementById(elementId)
    if (element) {
      element.classList.toggle(classNameToToggle)
    }
  },

  /**
   * Switches global page themes or semantic dark-mode targets.
   */
  toggleTheme: (themeRootSelector: string = 'html', dataAttributeName: string = 'theme-mode') => {
    if (typeof window === 'undefined') return
    const root = document.querySelector(themeRootSelector)
    if (root) {
      const current = root.getAttribute(`data-${dataAttributeName}`)
      const nextTheme = current === 'dark' ? 'light' : 'dark'
      root.setAttribute(`data-${dataAttributeName}`, nextTheme)
    }
  },
}
