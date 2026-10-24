import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { auth } from './auth'
import { folderRoutes } from './routes/folders'
import { noteRoutes } from './routes/notes'
import { searchRoutes } from './routes/search'
import { taskRoutes } from './routes/tasks'
import { trashRoutes } from './routes/trash'

const app = new Hono().basePath('/api')

app.on(['GET', 'POST'], '/auth/*', (c) => auth.handler(c.req.raw))

app.route('/folders', folderRoutes)
app.route('/notes', noteRoutes)
app.route('/search', searchRoutes)
app.route('/tasks', taskRoutes)
app.route('/trash', trashRoutes)

app.notFound((c) => c.json({ error: 'Not found' }, 404))

app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse()
  console.error(err)
  return c.json({ error: 'Something went wrong on the server' }, 500)
})

export default app
