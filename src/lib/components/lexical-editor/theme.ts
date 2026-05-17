// src/lib/components/lexical-editor/theme.ts
import type { EditorThemeClasses } from 'lexical'

export const lexicalTheme: EditorThemeClasses = {
  ltr: 'text-left',
  rtl: 'text-right',
  paragraph: 'body-large mb-4 text-on-surface',
  quote: 'blockquote',
  heading: {
    h1: 'display-small mb-4 mt-6 text-on-surface',
    h2: 'headline-large mb-4 mt-5 text-on-surface',
    h3: 'headline-medium mb-3 mt-4 text-on-surface',
    h4: 'title-large mb-2 mt-3 text-on-surface',
    h5: 'title-medium mb-2 mt-2 text-on-surface',
    h6: 'title-small mb-2 mt-2 text-on-surface',
  },
  list: {
    ol: 'list-decimal ml-6 mb-4 body-large text-on-surface',
    ul: 'list-disc ml-6 mb-4 body-large text-on-surface',
    listitem: 'mb-1',
    listitemChecked: 'line-through opacity-50',
    listitemUnchecked: '',
    nested: {
      listitem: 'list-none',
    },
  },
  image: 'rounded-xl max-w-full my-4 shadow-sm',
  link: 'text-primary underline cursor-pointer hover:text-primary/80 transition-colors',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    overflowed: 'opacity-50',
    hashtag: 'text-primary',
    underline: 'underline',
    strikethrough: 'line-through',
    underlineStrikethrough: 'underline line-through',
    code: 'bg-surface-container-highest px-1.5 py-0.5 rounded-md font-mono text-sm text-on-surface',
  },
  code: 'bg-surface-container-highest p-4 rounded-xl font-mono text-sm block my-4 overflow-x-auto text-on-surface shadow-inner',
}
