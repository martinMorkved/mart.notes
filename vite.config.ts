import devServer from '@hono/vite-dev-server'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Hono-koden leser process.env, som Vite ellers ikke fyller fra .env
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

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
    server: { port: 5180, strictPort: true },
  }
})
