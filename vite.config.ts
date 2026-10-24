import devServer from '@hono/vite-dev-server'
import react from '@vitejs/plugin-react'
import { networkInterfaces } from 'node:os'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

const PORT = 5180

// Lets a phone on the same network open the dev server and sign in
function lanOrigins() {
  return Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => `http://${i!.address}:${PORT}`)
}

export default defineConfig(({ mode, command }) => {
  // The Hono code reads process.env, which Vite doesn't fill from .env on its own
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  if (command === 'serve') process.env.DEV_TRUSTED_ORIGINS = lanOrigins().join(',')

  return {
    plugins: [
      react(),
      devServer({
        entry: 'server/app.ts',
        exclude: [/^(?!\/api\/).*/],
        injectClientScript: false,
      }),
    ],
    resolve: {
      alias: {
        '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: { host: true, port: PORT, strictPort: true },
  }
})
