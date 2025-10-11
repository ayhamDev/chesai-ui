import type { Preview } from '@storybook/react-vite'
import '../src/lib/tailwind/theme.css'
import { withTanstackRouter } from './withTanstackRouter'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [withTanstackRouter],
}

export default preview
