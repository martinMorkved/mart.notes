import { handle } from '@hono/node-server/vercel'
import app from './app'

// The serverless function on Vercel. scripts/vercel-output.mjs bundles it.
export default handle(app)
