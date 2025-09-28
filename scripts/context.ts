import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

// --- Configuration ---
// Base path for your library source files
const SRC_LIB_PATH = path.join(process.cwd(), 'src', 'lib')

// Output configuration
const OUTPUT_DIR = path.join(process.cwd(), '.LLM')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'context.mdx')

/**
 * Define all the source directories to be included in the context file.
 * - 'title': The markdown heading for this section.
 * - 'path': The absolute path to the directory.
 * - 'type': How to process the directory.
 *   - 'components': Special handling for component folders (component + story).
 *   - 'files': Simple handling, grabs all files with matching extensions.
 * - 'extensions': (Only for 'files' type) An array of file extensions to include.
 */
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
    extensions: ['.css', '.ts'], // Include .ts for potential tailwind.config.ts helpers
  },
]
// ---------------------

// --- Helper Functions (retained from original script) ---
async function findFileBySuffix(dirPath: string, suffix: string): Promise<string | null> {
  try {
    const files = await readdir(dirPath)
    const foundFile = files.find(file => file.endsWith(suffix))
    return foundFile ? path.join(dirPath, foundFile) : null
  } catch {
    return null
  }
}

async function findComponentFile(dirPath: string): Promise<string | null> {
  try {
    const files = await readdir(dirPath)
    const foundFile = files.find(file => file.endsWith('.tsx') && !file.endsWith('.stories.tsx'))
    return foundFile ? path.join(dirPath, foundFile) : null
  } catch {
    return null
  }
}

// --- Directory Processors ---

/**
 * Processes a directory of standard component folders, where each sub-folder
 * contains a component file and a story file.
 * @param dirPath The path to the components directory (e.g., 'src/lib/components').
 * @returns An array of formatted MDX blocks.
 */
async function processComponentDirectory(dirPath: string): Promise<string[]> {
  const mdxBlocks: string[] = []
  try {
    const componentFolders = await readdir(dirPath, { withFileTypes: true })

    for (const dirent of componentFolders) {
      if (dirent.isDirectory()) {
        const componentName = dirent.name
        const componentDirPath = path.join(dirPath, componentName)

        const componentFilePath = await findComponentFile(componentDirPath)
        const storyFilePath = await findFileBySuffix(componentDirPath, '.stories.tsx')

        if (componentFilePath && storyFilePath) {
          const componentCode = await Bun.file(componentFilePath).text()
          const storyCode = await Bun.file(storyFilePath).text()

          const block = `
### Component: \`${componentName}\`

This section contains the source code for the \`${componentName}\` component and its corresponding Storybook stories.

**Component Source (\`${path.relative(process.cwd(), componentFilePath)}\`)**
\`\`\`tsx
${componentCode.trim()}
\`\`\`

**Storybook Stories (\`${path.basename(storyFilePath)}\`)**
\`\`\`tsx
${storyCode.trim()}
\`\`\`
`
          mdxBlocks.push(block)
        }
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') console.error(`Error processing components in ${dirPath}:`, error)
  }
  return mdxBlocks
}

/**
 * Processes a generic directory, reading all files that match the allowed extensions.
 * @param dirPath The path to the directory.
 * @param allowedExtensions An array of extensions to include (e.g., ['.ts', '.css']).
 * @returns An array of formatted MDX blocks.
 */
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
    if (error.code !== 'ENOENT') console.error(`Error processing files in ${dirPath}:`, error)
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
        // Add a main header for the section and then all its content blocks
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
# AI Prompt Context for chesai-ui Component Library

You are an expert React developer tasked with assisting in the development of the "chesai-ui" library. The following document contains the complete source code for all UI components, hooks, contexts, and styling configurations.

**Your Task:**
- Use this file as the single source of truth for the entire library.
- When asked to create, modify, or extend any part of the library, refer to its source code provided here.
- Maintain the existing coding style, architecture, and conventions (e.g., using CVA, Radix UI, Framer Motion).
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
