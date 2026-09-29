import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
import { categories, guidance } from './component-registry.data.ts'

const destination = 'skills/chesai-md3-design/references/components'
const normalize = (value: string) => value.replaceAll('\\', '/')
const relative = (value: string) => normalize(path.relative(process.cwd(), path.resolve(value)))
const asset = (value: string) => `assets/llm/${value.replaceAll('/', '-')}.md`
function filesAt(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filename = `${directory}/${entry.name}`
    return entry.isDirectory() ? filesAt(filename) : [filename]
  }).filter(file => /\.(tsx?|mdx?|css)$/.test(file) && !/\.(test|spec|d)\.tsx?$/.test(file)).sort()
}

export function generateComponentRegistry(check = false) {
  const folders = fs.readdirSync('src/lib/components', { withFileTypes: true })
    .filter(entry => entry.isDirectory()).map(entry => entry.name)
  const expected = [...folders, 'context', 'hooks', 'utils'].sort()
  const described = guidance.map(entry => entry.folder).sort()
  if (JSON.stringify(expected) !== JSON.stringify(described)) {
    throw new Error(`Registry coverage mismatch. Missing: ${expected.filter(x => !described.includes(x))}; stale: ${described.filter(x => !expected.includes(x))}`)
  }
  const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile)
  if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'))
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd())
  if (parsed.errors.length) throw new Error('Cannot parse repository TypeScript configuration')
  const program = ts.createProgram(['src/lib/index.ts'], parsed.options)
  const checker = program.getTypeChecker()
  const source = program.getSourceFile('src/lib/index.ts')!
  const symbols = checker.getExportsOfModule(checker.getSymbolAtLocation(source)!)
  const exports = symbols.map(symbol => {
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
    const declaration = target.declarations?.[0]
    if (!declaration) throw new Error(`Unresolved public export: ${symbol.name}`)
    const origin = relative(declaration.getSourceFile().fileName)
    const sourcePath = origin.startsWith('src/lib/') ? origin : relative(symbol.declarations?.[0]?.getSourceFile().fileName || '')
    const match = sourcePath.match(/^src\/lib\/(?:components\/([^/]+)|(context|hooks|utils))\//)
    if (!match) throw new Error(`Unclassified export ${symbol.name}: ${sourcePath}`)
    const type = checker.getTypeOfSymbolAtLocation(target, declaration)
    const isValue = Boolean(target.flags & ts.SymbolFlags.Value)
    const members = isValue ? checker.getPropertiesOfType(type)
      .filter(member => /^[A-Z]/.test(member.name) && member.declarations?.some(d => relative(d.getSourceFile().fileName).startsWith('src/lib/')))
      .map(member => member.name).sort() : []
    const signature = type.getCallSignatures()[0]
    const parameter = signature?.parameters[0]
    const props = isValue && /^[A-Z]/.test(symbol.name) && parameter
      ? checker.getPropertiesOfType(checker.getTypeOfSymbolAtLocation(parameter, declaration))
        .filter(prop => prop.declarations?.some(d => relative(d.getSourceFile().fileName).startsWith('src/lib/')))
        .map(prop => prop.name).sort() : []
    return { name: symbol.name, kind: isValue ? 'value' : 'type', folder: match[1] || match[2], sourcePath, assetPath: asset(sourcePath), members, ownProps: props }
  }).sort((a, b) => a.name.localeCompare(b.name, 'en'))
  const families = guidance.map(entry => {
    if (!categories[entry.category]) throw new Error(`Unknown category: ${entry.category}`)
    const directory = `src/lib/${['context', 'hooks', 'utils'].includes(entry.folder) ? entry.folder : `components/${entry.folder}`}`
    const files = filesAt(directory)
    const publicExports = exports.filter(item => item.folder === entry.folder)
    if (entry.category === 'internal' && publicExports.length) throw new Error(`New public API needs editorial review: ${entry.folder}`)
    return { ...entry, status: publicExports.length ? 'public' : 'not-exported', exports: publicExports,
      sources: files.filter(file => !file.includes('.stories.')).map(sourcePath => ({ sourcePath, assetPath: asset(sourcePath) })),
      stories: files.filter(file => file.includes('.stories.')).map(sourcePath => ({ sourcePath, assetPath: asset(sourcePath) })),
    }
  }).sort((a, b) => a.folder.localeCompare(b.folder, 'en'))
  const link = (file: { sourcePath: string }) => `[${file.sourcePath.split('/').pop()}](../../../../${file.sourcePath})`
  const outputs = new Map<string, string>()
  for (const [category, title] of Object.entries(categories)) {
    const entries = families.filter(entry => entry.category === category)
    const lines = [`# ${title}`, '', '[Selection guide](../component-registry.md) · [Machine-readable registry](registry.json)', '',
      'Generated from the package-root exports and curated usage guidance. Import public names from `chesai-ui`. Own-prop lists are discovery hints, not complete signatures; inherited props, required fields, unions and callbacks must be checked in source/types. Compound members listed below may include helper data; consult the usage note before treating a value as JSX.', '',
      ...entries.map(entry => `- [${entry.folder}](#${entry.folder.toLowerCase()})`), '']
    for (const entry of entries) {
      lines.push(`## ${entry.folder}`, '', entry.usage, '', `**Availability:** ${entry.status === 'public' ? 'package-root public API' : 'not exported from chesai-ui; do not invent a package import'}.`, '')
      const values = entry.exports.filter(item => item.kind === 'value')
      const types = entry.exports.filter(item => item.kind === 'type')
      if (values.length) lines.push(`**Value exports:** ${values.map(item => `\`${item.name}\``).join(', ')}.`, '')
      if (types.length) lines.push(`**Type-only exports:** ${types.map(item => `\`${item.name}\``).join(', ')}. Use \`import type\`.`, '')
      for (const item of values) {
        if (item.members.length) lines.push(`- \`${item.name}\` members: ${item.members.map(name => `\`${item.name}.${name}\``).join(', ')}.`)
        if (item.ownProps.length) lines.push(`- \`${item.name}\` own props: ${item.ownProps.map(name => `\`${name}\``).join(', ')}.`)
      }
      lines.push('', `**Source:** ${entry.sources.map(link).join(', ') || 'No implementation in this folder.'}`, '',
        `**Examples:** ${entry.stories.map(link).join(', ') || 'No Storybook file in this folder; inspect the source contract.'}`, '')
    }
    outputs.set(`${destination}/${category}.md`, `${lines.join('\n')}\n`)
  }
  outputs.set(`${destination}/registry.json`, `${JSON.stringify({ schemaVersion: 1, package: 'chesai-ui', entrypoint: 'src/lib/index.ts', pathBase: 'sourcePath is repository-relative; assetPath is docs-root-relative', families }, null, 2)}\n`)
  for (const [filename, content] of outputs) {
    if (check) {
      if (!fs.existsSync(filename) || fs.readFileSync(filename, 'utf8') !== content) throw new Error(`Stale registry: ${filename}. Run npm run registry:generate.`)
    } else {
      fs.mkdirSync(path.dirname(filename), { recursive: true })
      fs.writeFileSync(filename, content)
    }
  }
  console.log(`Component registry ${check ? 'verified' : 'generated'}: ${folders.length} component folders, ${exports.length} public exports, ${families.length} documented families.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  generateComponentRegistry(process.argv.includes('--check'))
}
