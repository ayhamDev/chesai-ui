// scripts/generate-llm.ts
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

dotenv.config()
// --- CONFIGURATION ---
const SOURCE_DIR = 'src/lib'
const COMPONENTS_DIR = 'src/lib/components'
const OUTPUT_DIR = 'storybook-static'
const ASSETS_SUBDIR = 'assets/llm'
const FULL_OUTPUT_DIR = path.join(OUTPUT_DIR, ASSETS_SUBDIR)
const BASE_URL = process.env.BASE_URL || ''

// Exclusions
const EXCLUDE_DIRS = ['src/examples', 'node_modules', '.git', 'dist']
const IGNORE_FILES = ['.test.ts', '.spec.ts', '.test.tsx', '.spec.tsx', '.d.ts']
const INCLUDE_EXTENSIONS = ['.ts', '.tsx', '.css', '.mdx']

// Robots.txt Content (AI Permissive)
const ROBOTS_CONTENT = `User-agent: *
Allow: /

# OpenAI (ChatGPT)
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /

# Google (Gemini/Vertex)
User-agent: Google-Extended
Allow: /

# Anthropic (Claude)
User-agent: ClaudeBot
Allow: /
User-agent: anthropic-ai
Allow: /

# Common Crawl
User-agent: CCBot
Allow: /
`

// --- SKILL.MD CONTENT ---
const SKILL_MD_CONTENT = `# 🎨 Chesai UI: Expert Front-End Engineer & MD3 Specialist

## 👤 Role & Persona
You are an elite Front-End Engineer and UX/UI Designer specializing in React, Tailwind CSS, Framer Motion, and the **Material Design 3 (Material You)** design language. Your primary tool is **\`chesai-ui\`**, an advanced, highly-animated, and accessible component library.

Your goal is to write clean, performant, and hyper-responsive code that strictly adheres to \`chesai-ui\`'s component API, thematic tokens, and fluid layout paradigms.

## 🧠 Core Philosophy
1. **Material You Theming:** Never hardcode arbitrary colors (e.g., \`bg-blue-500\`). Always use semantic MD3 tokens (\`primary\`, \`surface-container\`, \`on-surface-variant\`).
2. **Fluid Motion:** Interfaces should feel alive. Utilize built-in physics, morphing AppBars, and \`BouncyBox\` interactions.
3. **Shape as Semantics:** Utilize the universal \`shape\` prop (\`full\`, \`minimal\`, \`sharp\`) to convey hierarchy and interactive states.
4. **Accessible by Default:** Rely on the underlying Radix UI primitives for keyboard navigation and ARIA attributes.

---

## 🎨 Theme, Palette, & Tailwind Configuration

### 1. Accessing Theme Variables in JavaScript / TypeScript
You can access theme tokens programmatically using the \`useTheme\` hook. The hook returns a \`palette\` object containing the standard CSS variables, and a \`getComputedColor\` helper to extract evaluated color values (e.g., for Canvas, Recharts, or third-party libraries).

\`\`\`tsx
import { useTheme } from "chesai-ui";

export function CustomWidget() {
  const { palette, getComputedColor } = useTheme();

  return (
    <div style={{ backgroundColor: palette.surfaceContainer }}>
      <canvas
        ref={(canvas) => {
          if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
              // Evaluates live computed colors from the DOM
              ctx.fillStyle = getComputedColor("primary"); 
              ctx.fillRect(0, 0, 100, 100);
            }
          }
        }}
      />
    </div>
  );
}
\`\`\`

### 2. Tailwind CSS IntelliSense Setup

#### Tailwind CSS v4 Projects
Tailwind CSS v4 automatically parses \`@theme\` directives inside imported dependency stylesheets. Client applications only need to import the stylesheet:
\`\`\`css
@import "tailwindcss";
@import "chesai-ui/styles.css";
\`\`\`

#### Tailwind CSS v3 Projects
For older projects utilizing a \`tailwind.config.js\`, use the exported \`chesaiColors\` helper to map the design tokens to standard Tailwind utility classes:
\`\`\`javascript
const { chesaiColors } = require("chesai-ui");

module.exports = {
  theme: {
    extend: {
      colors: {
        ...chesaiColors,
      },
    },
  },
};
\`\`\`

### 3. Complete Token Reference Mapping

The following keys are available under \`useTheme().palette.*\` and mapped to \`var(--md-sys-color-*)\` CSS variables:

| Palette Key | CSS Variable Name | Tailwind Color Utility | Description |
| :--- | :--- | :--- | :--- |
| \`primary\` | \`--md-sys-color-primary\` | \`primary\` | Primary branding color |
| \`onPrimary\` | \`--md-sys-color-on-primary\` | \`on-primary\` | Text/icons on primary |
| \`primaryContainer\` | \`--md-sys-color-primary-container\` | \`primary-container\` | Background container for primary actions |
| \`onPrimaryContainer\` | \`--md-sys-color-on-primary-container\` | \`on-primary-container\` | Text/icons on primary container |
| \`secondary\` | \`--md-sys-color-secondary\` | \`secondary\` | Secondary accent color |
| \`onSecondary\` | \`--md-sys-color-on-secondary\` | \`on-secondary\` | Text/icons on secondary |
| \`secondaryContainer\` | \`--md-sys-color-secondary-container\` | \`secondary-container\` | Background container for secondary actions |
| \`onSecondaryContainer\` | \`--md-sys-color-on-secondary-container\` | \`on-secondary-container\` | Text/icons on secondary container |
| \`tertiary\` | \`--md-sys-color-tertiary\` | \`tertiary\` | Tertiary accent color |
| \`onTertiary\` | \`--md-sys-color-on-tertiary\` | \`on-tertiary\` | Text/icons on tertiary |
| \`tertiaryContainer\` | \`--md-sys-color-tertiary-container\` | \`tertiary-container\` | Background container for tertiary actions |
| \`onTertiaryContainer\` | \`--md-sys-color-on-tertiary-container\` | \`on-tertiary-container\` | Text/icons on tertiary container |
| \`error\` | \`--md-sys-color-error\` | \`error\` | Error messages and danger states |
| \`onError\` | \`--md-sys-color-on-error\` | \`on-error\` | Text/icons on error backgrounds |
| \`errorContainer\` | \`--md-sys-color-error-container\` | \`error-container\` | Background container for error states |
| \`onErrorContainer\` | \`--md-sys-color-on-error-container\` | \`on-error-container\` | Text/icons on error container |
| \`background\` | \`--md-sys-color-background\` | \`background\` | Main page background |
| \`onBackground\` | \`--md-sys-color-on-background\` | \`on-background\` | Text/icons on background |
| \`surface\` | \`--md-sys-color-surface\` | \`surface\` | Card and sheet backgrounds |
| \`onSurface\` | \`--md-sys-color-on-surface\` | \`on-surface\` | Text/icons on surface elements |
| \`surfaceVariant\` | \`--md-sys-color-surface-variant\` | \`surface-variant\` | Secondary surface background |
| \`onSurfaceVariant\` | \`--md-sys-color-on-surface-variant\` | \`on-surface-variant\` | Text/icons on surface variant |
| \`outline\` | \`--md-sys-color-outline\` | \`outline\` | High-contrast borders |
| \`outlineVariant\` | \`--md-sys-color-outline-variant\` | \`outline-variant\` | Low-contrast dividers and borders |
| \`shadow\` | \`--md-sys-color-shadow\` | \`shadow\` | Shadow overlays |
| \`scrim\` | \`--md-sys-color-scrim\` | \`scrim\` | Modal backdrop overlays |
| \`inverseSurface\` | \`--md-sys-color-inverse-surface\` | \`inverse-surface\` | Dark contrast background in Light Mode |
| \`inverseOnSurface\` | \`--md-sys-color-inverse-on-surface\` | \`inverse-on-surface\` | Light contrast text in Light Mode |
| \`inversePrimary\` | \`--md-sys-color-inverse-primary\` | \`inverse-primary\` | Primary contrast brand color |
| \`surfaceDim\` | \`--md-sys-color-surface-dim\` | \`surface-dim\` | Dimmed surface background |
| \`surfaceBright\` | \`--md-sys-color-surface-bright\` | \`surface-bright\` | Brightened surface background |
| \`surfaceContainerLowest\` | \`--md-sys-color-surface-container-lowest\` | \`surface-container-lowest\` | Lowest elevation surface |
| \`surfaceContainerLow\` | \`--md-sys-color-surface-container-low\` | \`surface-container-low\` | Low elevation surface |
| \`surfaceContainer\` | \`--md-sys-color-surface-container\` | \`surface-container\` | Default elevation surface |
| \`surfaceContainerHigh\` | \`--md-sys-color-surface-container-high\` | \`surface-container-high\` | High elevation surface |
| \`surfaceContainerHighest\` | \`--md-sys-color-surface-container-highest\` | \`surface-container-highest\` | Highest elevation surface |

---

## 📱 Responsive Canonical Layouts (Crucial Architecture)
Based on Material Design 3 guidelines for large screens and foldables, applications must seamlessly transition between single-screen mobile views and multi-pane desktop/tablet views.

### Mapping UI to Chesai Components
When building app shells, map the structural elements to these specific components:

*   **Rail (Side Navigation):** Use \`<NavigationRail.Navigator>\` for tablets/desktops. Use \`<BottomTabs.Navigator>\` for mobile.
*   **Bar (Top Header):** Use \`<AppBar>\`. Leverage \`scrollBehavior="conditionally-sticky"\` and \`variant="large"\` for dynamic morphing.
*   **Panes (Content Areas):** 
    *   **Desktop/Tablet:** Use the \`<Resizable>\` component with \`<Resizable.Pane>\` and \`<Resizable.Handle>\` to create side-by-side List/Detail views.
    *   **Mobile:** Use \`<StackRouter>\` (\`createStackNavigator()\`) for native-feeling, slide-in screen transitions.

---

## 💻 Code Paradigm: The Responsive Split-View
Whenever asked to create a standard application layout (like an Inbox, Chat, or Dashboard), use the following pattern to handle responsiveness automatically:

\`\`\`tsx
import { useMediaQuery } from "@uidotdev/usehooks";
import { 
  NavigationRail, 
  BottomTabs, 
  Resizable, 
  AppBar, 
  createStackNavigator, 
  useNavigation 
} from "chesai-ui";

// 1. Define Mobile Stack
type AppStackParams = { List: undefined; Detail: { id: string } };
const Stack = createStackNavigator<AppStackParams>();

export default function AppLayout() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    return (
      <div className="h-screen w-full bg-background">
        <Stack.Navigator initialRouteName="List">
          <Stack.Screen name="List" component={MobileListScreen} />
          <Stack.Screen name="Detail" component={MobileDetailScreen} />
        </Stack.Navigator>
      </div>
    );
  }

  // --- DESKTOP/TABLET MULTI-PANE LAYOUT ---
  return (
    <div className="flex h-screen w-full bg-background">
      {/* 1. The Rail */}
      <NavigationRail.Navigator activeTab="inbox" onTabPress={() => {}} shape="full">
        <NavigationRail.Screen name="inbox" label="Inbox" icon={() => <InboxIcon />} />
      </NavigationRail.Navigator>

      {/* 2. The Panes */}
      <Resizable className="flex-1">
        {/* Pane 1: List */}
        <Resizable.Pane id="list" defaultWidth={380} className="bg-surface-container-lowest border-r border-outline-variant/30">
          <AppBar variant="medium" title="Inbox" />
          <ListContent />
        </Resizable.Pane>

        <Resizable.Handle target="list" variant="pill" />

        {/* Pane 2: Detail */}
        <Resizable.Pane id="detail" flex className="bg-surface">
           <AppBar variant="small" title="Detail View" />
           <DetailContent />
        </Resizable.Pane>
      </Resizable>
    </div>
  );
}
\`\`\`

---

## 🧱 Key Component Guidelines

### 1. The \`Item\` Ecosystem (Lists & Rows)
Never build custom list rows from scratch. Always use the \`Item\` compound components.
*   **Structure:** \`<Item>\` -> \`<ItemMedia>\` + \`<ItemContent>\` + \`<ItemActions>\`.
*   **Gestures:** Use \`swipeRightContent\` or \`swipeType="dismiss"\` for mobile-first swipe actions.
\`\`\`tsx
<Item variant="ghost" shape="minimal" onClick={handleClick}>
  <ItemMedia variant="avatar"><Avatar src={user.img} /></ItemMedia>
  <ItemContent>
    <ItemTitle>{user.name}</ItemTitle>
    <ItemDescription>{user.message}</ItemDescription>
  </ItemContent>
</Item>
\`\`\`

### 2. Theming & Colors
Do not use raw hex codes or standard Tailwind colors unless specifically requested. Use Chesai's CSS variables mapped to Tailwind classes:
*   **Backgrounds:** \`bg-surface\`, \`bg-surface-container-low\`, \`bg-surface-container-highest\`, \`bg-primary-container\`.
*   **Text:** \`text-on-surface\`, \`text-on-surface-variant\`, \`text-on-primary\`.
*   **Borders:** \`border-outline\`, \`border-outline-variant\`.

### 3. Typography
Always use the \`<Typography>\` component. Never use raw \`<h1>\`, \`<p>\`, or standard Tailwind text utilities for main content.
*   **Variants:** \`display-large\`, \`headline-medium\`, \`title-small\`, \`body-large\`, \`label-medium\`.
*   **Props:** Use \`muted={true}\` instead of \`text-gray-500\`.

### 4. Overlays (Dialogs & Sheets)
Avoid using inline state (\`isOpen\`) for global modals. Prefer the imperative Context APIs for cleaner component trees:
\`\`\`tsx
import { useDialog, useActionSheet } from "chesai-ui";

const { show: showDialog } = useDialog();
const { show: showSheet } = useActionSheet();

// Call programmatically
showDialog({
  title: "Delete File?",
  description: "This cannot be undone.",
  destructive: true,
  confirmLabel: "Delete",
  onConfirm: () => handleDelete()
});
\`\`\`

### 5. Forms & Inputs
Wrap form inputs using the \`<Field>\` API to get automatic layout, labeling, and error handling.
\`\`\`tsx
<Field isInvalid={hasError}>
  <FieldLabel>Email Address</FieldLabel>
  <Input variant="filled" shape="minimal" startContent={<MailIcon />} />
  <FieldError errors={["Invalid email format"]} />
</Field>
\`\`\`

---

## 🚫 Anti-Patterns (Do NOT do these)

1. **DO NOT** use \`<a href="...">\` for internal routing. Use \`LayoutRouter.Link\` or \`ShallowRouter\`'s \`useRouter().push()\`.
2. **DO NOT** manually manage CSS transitions for simple hover states. Rely on the \`variant\` and \`shape\` props of components like \`Button\`, \`IconButton\`, and \`Card\`, which have built-in ripple effects and state layers.
3. **DO NOT** use \`overflow-auto\` randomly. Use the \`<ElasticScrollArea>\` component for native-feeling rubber-band scrolling.
4. **DO NOT** build custom loading spinners. Use \`<LoadingIndicator variant="material-morph" />\`.
5. **DO NOT** construct complex data tables from scratch. Use \`<DataTable>\` which handles virtualization, filtering, and pagination out of the box.

---

## 🎯 LLM Output Requirements
When asked to generate code:
1. Provide the complete, copy-pasteable React component.
2. Assume all \`chesai-ui\` components are exported from \`"chesai-ui"\`.
3. Assume \`lucide-react\` or \`Material Symbols\` or \`iconify\` is used for icons.
4. Prioritize clean, semantic MD3 hierarchy (e.g., placing a \`surface-container-high\` Card on top of a \`surface\` background).
5. Always consider the mobile vs. desktop experience using the Multi-Pane paradigms.
`

const SHARED_OVERVIEW = `
**Library Name:** chesai-ui
**Core Stack:** React, TypeScript, Tailwind CSS (modern @theme syntax), Framer Motion, Radix UI Primitives.
**Design System:** Material Design 3 (MD3) / Material You.

## Overview
chesai-ui is an expressive, high-performance UI library designed for modern web and mobile-web applications. It focuses on the "Material You" philosophy, featuring fluid morphing animations, physics-based interactions, and a deep integration with browser history for navigation.

## Key Features
- **Theming:** Multi-level contrast support (Standard, Medium, High) across Light/Dark modes using MD3 tokens.
- **Palette Access:** Accessible programmatically via \`useTheme().palette.*\` or evaluated dynamically using \`useTheme().getComputedColor('*')\`.
- **Navigation:** Includes a native-like 'StackRouter' (React Navigation style), 'ShallowRouter' for URL-synced UI state, and responsive 'NavigationRail'/'BottomTabs'.
- **Expressive Motion:** Powered by Framer Motion. Includes 'ElasticScrollArea' (iOS-style rubber-banding), 'MaterialMorph' loading indicators, and shared-layout transitions.
- **Virtualized Layouts:** Optimized components for large datasets including 'VirtualGrid', 'VirtualFlex', and 'VirtualMasonry' (via TanStack Virtual).
- **Data & Maps:** Built-in support for 'MapLibre' (Map) and 'Recharts' (Charts), fully integrated with the system's color tokens.
- **Global Context:** Managed via 'ChesaiProvider', which coordinates theming, accessibility, and imperative APIs for 'Dialogs' and 'ActionSheets'.

---

## Installation

\`\`\`bash
npm install chesai-ui lucide-react (or any other icon library of your choice)
# or 
pnpm add chesai-ui lucide-react  (or any other icon library of your choice)
\`\`\`
*(Note: \`lucide-react\` or \`Material Symbols\` or \`iconify\` is highly recommended as it is the standard icon library used across chesai-ui)*

---

## Setup

### Next.js (App Router)
Wrap your application with the \`ChesaiProvider\` in your root layout and import the styles.

**\`app/layout.tsx\`**
\`\`\`tsx
import "chesai-ui/styles.css";
import { ChesaiProvider } from "chesai-ui";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChesaiProvider defaultTheme="system">
          {children}
        </ChesaiProvider>
      </body>
    </html>
  );
}
\`\`\`

### React (Vite / CRA)
Wrap your app near the mounting entry point.

**\`src/main.tsx\`**
\`\`\`tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "chesai-ui/styles.css";
import { ChesaiProvider } from "chesai-ui";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChesaiProvider defaultTheme="system">
      <App />
    </ChesaiProvider>
  </React.StrictMode>
);
\`\`\`

---

## Theme Customization

\`ChesaiProvider\` handles dynamic theme generation using the Material You algorithms. You can instantly brand your app by providing a \`defaultSeedColor\` prop. It will automatically generate cohesive primary, secondary, and tertiary tonal palettes for light and dark modes.

\`\`\`tsx
<ChesaiProvider
  defaultTheme="light"
  defaultSeedColor="#3b82f6" // Automatically generates a beautiful 5-key tonal palette
  defaultFonts={{
    brand: 'Manrope',  // Headings
    plain: 'Inter',    // Body text
  }}
  defaultOverrides={{
    primary: '#ff0000', // Explicitly override a specific MD3 token if needed
  }}
>
  <App />
</ChesaiProvider>
\`\`\`
`

// Categories Mapping (Thoroughly updated with all components from the library)
const CATEGORIES: Record<string, string[]> = {
  'Form & Input': [
    'button',
    'button-group',
    'checkbox',
    'chip',
    'color-picker',
    'combobox',
    'date-input',
    'date-picker',
    'dropzone',
    'fab',
    'fab-menu',
    'field',
    'icon-button',
    'input',
    'input-group',
    'lexical-editor',
    'medium-text-editor',
    'multi-select',
    'number-input',
    'otp-field',
    'radio-group',
    'rich-text-editor',
    'select',
    'slider',
    'split-button',
    'switch',
    'textarea',
    'time-picker',
  ],
  Layout: ['divider', 'elastic-scroll-area', 'infinite-scroll', 'item', 'layout', 'resizable', 'separator'],
  Navigation: [
    'animated-outlet',
    'appbar',
    'bottom-tabs',
    'breadcrumb',
    'command',
    'layout-router',
    'layout-toggle',
    'menubar',
    'navigation-menu',
    'navigation-rail',
    'search-view',
    'shallow-router',
    'sidebar',
    'stack-router',
    'tabs',
    'taskbar',
    'toolbar',
    'view-transition',
  ],
  'Overlays & Feedback': [
    'action-sheet',
    'alert',
    'badge',
    'bouncy-box',
    'context-menu',
    'dialog',
    'dropdown-menu',
    'empty-state',
    'loadingIndicator',
    'progress',
    'pull-to-refresh',
    'sheet',
    'skeleton',
    'stepper',
    'toast',
    'tooltip',
    'window-controls',
  ],
  'Data Display & Media': [
    'accordion',
    'avatar',
    'card',
    'charts',
    'data-display',
    'data-table',
    'device',
    'editor',
    'full-calendar',
    'image',
    'kbd',
    'location-picker',
    'map',
    'material3-carousel',
    'qr-code',
    'shape',
    'table',
    'typography',
    'video-player',
    'virtual-list',
    'website-studio',
  ],
  Misc: ['theme-controls'],
}

// --- HELPERS ---

function toTitleCase(str: string) {
  return str
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath)
  files.forEach(file => {
    const fullPath = path.join(dirPath, file)
    const isExcluded = EXCLUDE_DIRS.some(exclude => fullPath.includes(path.normalize(exclude)))
    if (fs.statSync(fullPath).isDirectory()) {
      if (!isExcluded) arrayOfFiles = getAllFiles(fullPath, arrayOfFiles)
    } else {
      if (!isExcluded) arrayOfFiles.push(fullPath)
    }
  })
  return arrayOfFiles
}

function generate() {
  console.log(`🚀 Starting Generation...`)

  // 1. Setup Directories
  if (!fs.existsSync(FULL_OUTPUT_DIR)) fs.mkdirSync(FULL_OUTPUT_DIR, { recursive: true })

  // 2. Generate Robots.txt
  console.log(`🤖 Generating robots.txt...`)
  fs.writeFileSync(path.join(OUTPUT_DIR, 'robots.txt'), ROBOTS_CONTENT)

  // 3. Generate Skill.md
  console.log(`🧠 Generating skill.md...`)
  fs.writeFileSync(path.join(OUTPUT_DIR, 'skill.md'), SKILL_MD_CONTENT)

  // 4. Generate Individual Assets & Full Context
  const allFiles = getAllFiles(SOURCE_DIR)

  const validFiles = allFiles
    .filter(filePath => {
      const ext = path.extname(filePath)
      const isIgnored = IGNORE_FILES.some(ignore => filePath.endsWith(ignore))
      return INCLUDE_EXTENSIONS.includes(ext) && !isIgnored
    })
    .map(filePath => {
      const relativePath = path.relative(process.cwd(), filePath).split(path.sep).join('/')
      // Create flat filename: src/lib/components/button/index.tsx -> src-lib-components-button-index.tsx
      const flatName = relativePath.replace(/[/\\]/g, '-')
      return {
        originalPath: relativePath,
        content: fs.readFileSync(filePath, 'utf-8'),
        ext: path.extname(filePath).replace('.', ''),
        flatName,
        assetFileName: `${flatName}.md`,
      }
    })

  // Write Individual Assets
  validFiles.forEach(file => {
    const mdContent = [`# ${file.originalPath}`, ``, `\`\`\`${file.ext}`, file.content, `\`\`\``].join('\n')
    fs.writeFileSync(path.join(FULL_OUTPUT_DIR, file.assetFileName), mdContent)
  })

  // Write llm-full.txt
  const fullContent = [
    `# Full Source Code`,
    `\n---\n`,
    SHARED_OVERVIEW,
    `\n\n`,
    ...validFiles.map(f => `\n## File: ${f.originalPath}\n\`\`\`${f.ext}\n${f.content}\n\`\`\``),
  ].join('\n')
  fs.writeFileSync(path.join(OUTPUT_DIR, 'llm-full.txt'), fullContent)

  // 5. Generate Categorized llm.txt Index
  console.log(`📝 Generating component index...`)

  let indexContent = `# chesai-ui Component Registry\n\n`
  indexContent += `> Legend: **[Source]** = Implementation file, **[Stories]** = Storybook file.\n\n`
  indexContent += `\n${SHARED_OVERVIEW}\n\n`

  // Scan component directories
  const componentFolders = fs
    .readdirSync(COMPONENTS_DIR)
    .filter(f => fs.statSync(path.join(COMPONENTS_DIR, f)).isDirectory())

  // Bucket folders into categories
  const bucketed: Record<string, string[]> = {}
  componentFolders.forEach(folder => {
    let placed = false
    for (const [cat, items] of Object.entries(CATEGORIES)) {
      if (items.includes(folder)) {
        bucketed[cat] = bucketed[cat] || []
        bucketed[cat].push(folder)
        placed = true
        break
      }
    }
    if (!placed) {
      bucketed['Misc'] = bucketed['Misc'] || []
      bucketed['Misc'].push(folder)
    }
  })

  // Build the Markdown Output
  for (const [category, folders] of Object.entries(bucketed)) {
    if (!folders || folders.length === 0) continue

    indexContent += `## ${category}\n\n`

    folders.sort().forEach(folder => {
      const folderTitle = toTitleCase(folder)
      const folderPath = path.join(COMPONENTS_DIR, folder)

      // Get all valid files inside this specific component folder
      const filesInFolder = fs.readdirSync(folderPath).filter(f => {
        // Simple filter for files only
        return !fs.statSync(path.join(folderPath, f)).isDirectory()
      })

      const sourceLinks: string[] = []
      const storyLinks: string[] = []

      filesInFolder.forEach(filename => {
        // Skip ignored files (tests, d.ts)
        if (IGNORE_FILES.some(ignore => filename.endsWith(ignore))) return

        // Reconstruct the flat asset name
        // Path: src/lib/components/{folder}/{filename}
        const relPath = path.join('src/lib/components', folder, filename)
        // Flatten: src-lib-components-{folder}-{filename}.md
        const flatName = relPath.split(path.sep).join('-') + '.md'

        const url = `${BASE_URL}/${ASSETS_SUBDIR}/${flatName}`.replace(/([^:]\/)\/+/g, '$1')
        const link = `[${filename}](${url})`

        if (filename.includes('.stories.')) {
          storyLinks.push(link)
        } else {
          sourceLinks.push(link)
        }
      })

      // Write Entry
      if (sourceLinks.length > 0 || storyLinks.length > 0) {
        indexContent += `### ${folderTitle}\n`
        if (sourceLinks.length) indexContent += `- **Source**: ${sourceLinks.join(', ')}\n`
        if (storyLinks.length) indexContent += `- **Stories**: ${storyLinks.join(', ')}\n`
        indexContent += `\n`
      }
    })
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'llm.txt'), indexContent)
  console.log(`✅ Complete! Generated robots.txt, skill.md, llm.txt, llm-full.txt, and ${validFiles.length} assets.`)
}

generate()
