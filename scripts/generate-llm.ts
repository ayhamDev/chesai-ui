import fs from 'node:fs'
import path from 'node:path'

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

// Categories Mapping
const CATEGORIES: Record<string, string[]> = {
  'Form & Input': [
    'button',
    'button-group',
    'calculator-input',
    'checkbox',
    'chip',
    'date-picker',
    'fab',
    'icon-button',
    'input',
    'number-input',
    'otp-field',
    'radio-group',
    'select',
    'slider',
    'split-button',
    'switch',
    'textarea',
    'time-picker',
  ],
  Layout: [
    'elastic-scroll-area',
    'flex',
    'grid',
    'infinite-scroll',
    'item',
    'layout-router',
    'masonry',
    'resizable',
    'separator',
    'stack-router',
    'virtual-flex',
    'virtual-grid',
    'virtual-item-list',
    'virtual-masonry',
  ],
  Navigation: [
    'appbar',
    'bottom-tabs',
    'command',
    'menubar',
    'navigation-menu',
    'navigation-rail',
    'search-view',
    'shallow-router',
    'sidebar',
    'tabs',
    'taskbar',
    'toolbar',
  ],
  'Overlays & Feedback': [
    'badge',
    'bouncy-box',
    'context-menu',
    'dialog',
    'dropdown-menu',
    'loadingIndicator',
    'pull-to-refresh',
    'sheet',
    'skeleton',
    'toast',
    'tooltip',
    'window-controls',
  ],
  'Data Display & Media': [
    'accordion',
    'avatar',
    'calendar',
    'card',
    'charts',
    'data-table',
    'device',
    'kbd',
    'shape',
    'table',
    'typography',
    'video-player',
  ],
  Misc: [],
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

  // 3. Generate Individual Assets & Full Context
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
    `\n---`,
    ...validFiles.map(f => `\n## File: ${f.originalPath}\n\`\`\`${f.ext}\n${f.content}\n\`\`\``),
  ].join('\n')
  fs.writeFileSync(path.join(OUTPUT_DIR, 'llm-full.txt'), fullContent)

  // 4. Generate Categorized llm.txt Index
  console.log(`📝 Generating component index...`)

  let indexContent = `# chesai-ui Component Registry\n\n`
  indexContent += `> Legend: **[Source]** = Implementation file, **[Stories]** = Storybook file.\n\n`

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
  console.log(`✅ Complete! Generated robots.txt, llm.txt, llm-full.txt, and ${validFiles.length} assets.`)
}

generate()
