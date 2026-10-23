import { createMiddleware } from 'hono/factory'
import { auth } from './auth'

export type AppEnv = {
  Variables: {
    userId: string
  }
}

export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Ikke innlogget' }, 401)
  c.set('userId', session.user.id)
  await next()
})
