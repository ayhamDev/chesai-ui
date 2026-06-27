import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { UserConfigExport } from 'vite'
import dts from 'vite-plugin-dts'
import { configDefaults, defineConfig } from 'vitest/config'
import pkg from './package.json'

const app = async (): Promise<UserConfigExport> => {
  return defineConfig({
    plugins: [
      react(),
      dts({
        insertTypesEntry: true,
        exclude: ['**/*.stories.tsx', '**/*.test.tsx']
      }),
      tailwindcss(),
    ],
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/lib/index.ts'),
        formats: ['es'],
      },
      rollupOptions: {
        external: (id) => {
          // Externalize all dependencies to prevent bundling them into the library.
          const deps = [
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.peerDependencies || {}),
            'react/jsx-runtime',
            'tailwindcss'
          ];
          return deps.some(dep => id === dep || id.startsWith(`${dep}/`));
        },
        output: {
          // Preserves the file/folder structure for impeccable tree-shaking
          preserveModules: true,
          preserveModulesRoot: 'src/lib',
          entryFileNames: '[name].mjs',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'chesai-ui.css';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      coverage: {
        exclude: [
          ...(configDefaults.coverage.exclude ?? []),
          '**/storybook-static/*',
          '**/*.stories.tsx',
          '**/*.config.js',
        ],
      },
    },
  })
}
// https://vitejs.dev/config/
export default app
