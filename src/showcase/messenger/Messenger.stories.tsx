import type { Meta, StoryObj } from '@storybook/react'
import { Messenger } from './Messenger'

const meta = {
  title: 'Showcase/Apps/Telegram',
  component: Messenger,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A complete, local messenger showcase composed from Chesai UI. Search, filters, drafts, replies, reactions, saved messages, contact profiles, stories, settings, and simulated calls. No account, backend, or network access is needed. State lasts for the current session; reload to reset.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Messenger>
export default meta
type Story = StoryObj<typeof meta>
export const App: Story = {}
