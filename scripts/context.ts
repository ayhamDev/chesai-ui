// scripts/context.ts
import { mkdir, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

// --- Configuration ---
// Base path for your library source files
const SRC_LIB_PATH = path.join(process.cwd(), 'src', 'lib')

// Output configuration
const OUTPUT_DIR = path.join(process.cwd(), '.LLM')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'context.mdx')

const CONTEXT_SOURCES = [
  {
    title: 'UI Components',
    path: path.join(SRC_LIB_PATH, 'components'),
    type: 'components',
  },
  {
    title: 'React Context',
    path: path.join(SRC_LIB_PATH, 'context'),
    type: 'files',
    extensions: ['.ts', '.tsx'],
  },
  {
    title: 'Custom Hooks',
    path: path.join(SRC_LIB_PATH, 'hooks'),
    type: 'files',
    extensions: ['.ts', '.tsx'],
  },
  {
    title: 'Tailwind & Styling',
    path: path.join(SRC_LIB_PATH, 'tailwind'),
    type: 'files',
    extensions: ['.css', '.ts'], 
  },
]

// --- Helper Functions ---

async function recursiveFindFiles(dir: string, allowedExtensions: string[]): Promise<string[]> {
  const files: string[] = []
  try {
    const items = await readdir(dir, { withFileTypes: true })
    for (const item of items) {
      const fullPath = path.join(dir, item.name)
      if (item.isDirectory()) {
        files.push(...(await recursiveFindFiles(fullPath, allowedExtensions)))
      } else if (item.isFile() && allowedExtensions.some(ext => item.name.endsWith(ext))) {
        files.push(fullPath)
      }
    }
  } catch {
    // Ignore errors during traversal
  }
  return files
}

async function findMainComponentFile(dirPath: string): Promise<string | null> {
  const files = await recursiveFindFiles(dirPath, ['.tsx'])
  const mainFile = files.find(file => !file.endsWith('.stories.tsx') && !file.endsWith('.test.tsx'))
  return mainFile || null
}

// --- Directory Processors ---

async function processComponentDirectory(dirPath: string): Promise<string[]> {
  const mdxBlocks: string[] = []
  try {
    const componentFolders = await readdir(dirPath, { withFileTypes: true })

    for (const dirent of componentFolders) {
      if (dirent.isDirectory()) {
        const componentName = dirent.name
        const componentDirPath = path.join(dirPath, componentName)

        const allSourceFiles = await recursiveFindFiles(componentDirPath, ['.tsx', '.ts'])

        const storyFilePath = allSourceFiles.find(file => file.endsWith('.stories.tsx'))
        const componentFiles = allSourceFiles.filter(file => file !== storyFilePath)

        const mainComponentFilePath = await findMainComponentFile(componentDirPath)

        if (componentFiles.length > 0) {
          const blocks: string[] = []

          blocks.push(`\n### Component: \`${componentName}\``)
          blocks.push(
            `This section includes all related source files for the \`${componentName}\` component, including nested sub-components (like \`header.tsx\`) and utilities.`,
          )

          for (const filePath of componentFiles.sort()) {
            const fileContent = await Bun.file(filePath).text()
            const relativePath = path.relative(process.cwd(), filePath)
            const lang = path.extname(filePath).substring(1)

            blocks.push(`
**Source File (\`${relativePath}\`)**
\`\`\`${lang}
${fileContent.trim()}
\`\`\`
`)
          }

          if (storyFilePath) {
            const storyCode = await Bun.file(storyFilePath).text()
            blocks.push(`
**Storybook Stories (\`${path.basename(storyFilePath)}\`)**
\`\`\`tsx
${storyCode.trim()}
\`\`\`
`)
          }

          mdxBlocks.push(blocks.join('\n'))
        }
      }
    }
  } catch (error) {
    if ((error as any).code !== 'ENOENT') console.error(`Error processing components in ${dirPath}:`, error)
  }
  return mdxBlocks
}

async function processGenericDirectory(dirPath: string, allowedExtensions: string[]): Promise<string[]> {
  const mdxBlocks: string[] = []
  try {
    const files = await readdir(dirPath)
    for (const file of files) {
      if (allowedExtensions.some(ext => file.endsWith(ext))) {
        const filePath = path.join(dirPath, file)
        const fileContent = await Bun.file(filePath).text()
        const lang = path.extname(file).substring(1)

        const block = `
### Source: \`${path.relative(process.cwd(), filePath)}\`

\`\`\`${lang}
${fileContent.trim()}
\`\`\`
`
        mdxBlocks.push(block)
      }
    }
  } catch (error) {
    if ((error as any).code !== 'ENOENT') console.error(`Error processing files in ${dirPath}:`, error)
  }
  return mdxBlocks
}

// --- Main Execution ---

async function generateAIContext() {
  console.log('🚀 Starting AI context generation...')

  try {
    const allMdxBlocks: string[] = []

    for (const source of CONTEXT_SOURCES) {
      process.stdout.write(`  - Processing Section: ${source.title}... `)
      let sectionBlocks: string[] = []

      if (source.type === 'components') {
        sectionBlocks = await processComponentDirectory(source.path)
      } else if (source.type === 'files') {
        sectionBlocks = await processGenericDirectory(source.path, source?.extensions)
      }

      if (sectionBlocks.length > 0) {
        const sectionHeader = `\n---\n\n## ${source.title}\n`
        allMdxBlocks.push(sectionHeader, ...sectionBlocks)
        console.log(`✅ (${sectionBlocks.length} items)`)
      } else {
        console.log('⚠️  (skipped: no files found)')
      }
    }

    if (allMdxBlocks.length === 0) {
      console.error('❌ No source files found or processed. Please check the CONTEXT_SOURCES configuration.')
      return
    }

    await mkdir(OUTPUT_DIR, { recursive: true })

    const introPrompt = `
# AI Prompt Context for chesai-ui Component Library (Material Design 3 Inspired)

You are an expert React developer assisting with the development and usage of the "chesai-ui" library. The following document contains the complete source code for all UI components, hooks, contexts, and styling configurations.

**Theme & Palette Guidelines:**
- Programmatic access to variables should utilize the \`useTheme().palette\` object (e.g. \`palette.primary\`, \`palette.surfaceContainer\`).
- If an exact evaluated RGB/Hex string is required (for canvas or non-CSS engines), invoke \`useTheme().getComputedColor(key)\` with a valid palette key.
- Custom Tailwind colors are integrated natively via CSS \`@theme\` in v4, and via the exported \`chesaiColors\` config mapping for v3 projects.

**Development Guidelines:**
- Use this file as the single source of truth for the entire library.
- When asked to create, modify, or extend any part of the library, refer to its source code provided here.
- Maintain the existing coding style, architecture, and conventions (using CVA, Radix UI, Framer Motion).
- Provide complete, copy-pasteable code blocks for your solutions.
`

    const finalMdxContent = introPrompt + allMdxBlocks.join('\n')
    await Bun.write(OUTPUT_FILE, finalMdxContent)

    console.log(`\n🎉 Success! AI context file created at: ${OUTPUT_FILE}`)
  } catch (error) {
    console.error('\n❌ An error occurred during context generation:', error)
  }
}

generateAIContext()
