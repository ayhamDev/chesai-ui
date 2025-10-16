import type { Preview } from '@storybook/react-vite'
import { themes } from '@storybook/theming'
import '../src/lib/tailwind/theme.css'

const preview: Preview = {
  parameters: {
    darkMode: {
      // Add the class names you defined in your CSS
      classTarget: 'html',
      darkClass: 'theme-dark',
      lightClass: 'theme-light',
      // Set the default theme for Storybook
      current: 'light',
      stylePreview: true,
      // Optional: You can customize the Storybook UI theme as well
      dark: { ...themes.dark, appBg: '#121212' },
      light: { ...themes.normal, appBg: '#FDFBFA' },
    },

    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [],
}

export default preview
