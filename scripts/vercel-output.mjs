// Builds what Vercel serves, in its Build Output API format: the Vite build as static files,
// and the Hono server bundled into one function. Bundling here means Vercel never has to
// compile the server's TypeScript itself.
import { build } from 'esbuild'
import { cp, rm, writeFile } from 'node:fs/promises'

const out = '.vercel/output'
const fn = `${out}/functions/api.func`

await rm(out, { recursive: true, force: true })
await cp('dist', `${out}/static`, { recursive: true })

await build({
  entryPoints: ['server/vercel.ts'],
  outfile: `${fn}/index.mjs`,
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  // Some dependencies are CommonJS and call require() for Node's own modules
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
  logLevel: 'warning',
})

const json = (value) => JSON.stringify(value, null, 2)

await writeFile(
  `${fn}/.vc-config.json`,
  json({ runtime: 'nodejs22.x', handler: 'index.mjs', launcherType: 'Nodejs', shouldAddHelpers: false }),
)

await writeFile(
  `${out}/config.json`,
  json({
    version: 3,
    routes: [
      // Vite puts a hash in these file names, so they never change
      { src: '^/assets/(.*)$', headers: { 'cache-control': 'public, max-age=31536000, immutable' }, continue: true },
      { handle: 'filesystem' },
      { src: '^/api(/.*)?$', dest: '/api' },
      // Every other path is a page in the React app
      { src: '^/(.*)$', dest: '/index.html' },
    ],
  }),
)
