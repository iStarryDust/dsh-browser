import { join } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'tsdown'
import { WorkspaceTypertGenerator } from '../../typert/generator/lib/types/workspace.js'

/**
 * Package-local host build: tsc emits `lib/types`, this pass bundles the
 * loader entry to `lib` and runs the Typert generator for THIS package only —
 * the same artifacts the workspace host build emits (typert.host.* and
 * typert.remote-client.*), without sweeping packages this bundle never
 * touches. The generator consumes the tsc output, so it must run after it.
 */
const PACKAGE = '@istarry/dsh-browser'

function focusedTypert(): Plugin {
  return {
    name: 'dsh-typert-generator-focused',
    closeBundle() {
      const root = join(import.meta.dirname, '../../..')
      const generator = new WorkspaceTypertGenerator(root, { checkDiagnostics: false })
      const artifacts = generator.generate([PACKAGE], ['host'])
      const output = join(import.meta.dirname, 'lib')
      mkdirSync(output, { recursive: true })
      for (const artifact of artifacts) {
        writeFileSync(join(output, `typert.${artifact.face}.js`), artifact.js)
        writeFileSync(join(output, `typert.${artifact.face}.d.ts`), artifact.dts)
        if (artifact.remote !== undefined) {
          writeFileSync(join(output, 'typert.remote-client.js'), artifact.remote.js)
          writeFileSync(join(output, 'typert.remote-client.d.ts'), artifact.remote.dts)
          writeFileSync(join(output, 'typert.remote-client.d.ts.map'), artifact.remote.dtsMap)
        }
      }
    },
  }
}

export default defineConfig({
  entry: ['lib/types/index.js'],
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  clean: false,
  plugins: [focusedTypert()],
})
