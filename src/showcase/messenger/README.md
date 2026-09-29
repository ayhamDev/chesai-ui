# Telegram / Chesai app showcase

Open **Showcase → Apps → Telegram → App** in Storybook. The app fills its viewport: desktop shows conversations alongside the active chat; mobile uses a chat list and a back button. It inherits the current Chesai theme, including dark mode.

The UI composes Chesai's Flex, Typography, Avatar, Button, IconButton, Chip, Badge, Card, BottomTabs, Chat, ElasticScrollArea, Input, Textarea, DropdownMenu, Popover, Dialog, Sheet, Switch and EmptyState. The small CSS file only adapts button content layout and adds reduced-motion-aware mobile navigation transitions. No custom color palette or external image service is used.

## Try it

- Search by contact name or message content; combine category and unread filters.
- Compose a message, switch conversations, and return to your draft. Enter sends; Shift+Enter adds a line. IME composition does not submit.
- Use message menus to reply, react, save, or delete your own messages with confirmation.
- Add an emoji or one of the sample documents; open documents from messages or contact profiles.
- Pin or mute conversations, search inside a chat, and jump to the latest message after scrolling up.
- Browse contacts, call history and friends' stories. Stories have pause, previous/next, keyboard navigation and a message shortcut. Automatic progression is disabled with reduced motion.
- Try a simulated call: mute, speaker, duration and call history work locally.
- Edit the demo display name, toggle unread badges, compact the list, or turn off the wallpaper in settings.

All data is fictional and kept in React state. No messages, calls or files leave the browser. Reloading resets the demo; there is no backend or authentication. Call and document previews are explicitly labeled as demos.

Run `vitest run src/showcase/messenger` for the state and interaction checks.
