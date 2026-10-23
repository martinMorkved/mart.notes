import { zValidator } from '@hono/zod-validator'
import { and, eq, isNull } from 'drizzle-orm'
import { generateKeyBetween } from 'fractional-indexing'
import { Hono } from 'hono'
import { createNote, updateNote } from '../../shared/schemas'
import { db } from '../db'
import { notes } from '../db/schema'
import { type AppEnv, requireUser } from '../env'
import { ownsFolder } from './folders'

const noteColumns = {
  id: notes.id,
  folderId: notes.folderId,
  title: notes.title,
  content: notes.content,
  position: notes.position,
  createdAt: notes.createdAt,
  updatedAt: notes.updatedAt,
}

function liveNote(userId: string, id: string) {
  return and(eq(notes.id, id), eq(notes.userId, userId), isNull(notes.deletedAt))
}

const notFound = { error: 'Note not found' }

export const noteRoutes = new Hono<AppEnv>()
  .use(requireUser)

  .post('/', zValidator('json', createNote), async (c) => {
    const { id, folderId, title } = c.req.valid('json')
    const userId = c.var.userId
    if (!(await ownsFolder(userId, folderId))) return c.json({ error: 'Folder not found' }, 404)

    // New notes go on top
    const [first] = await db
      .select({ position: notes.position })
      .from(notes)
      .where(eq(notes.folderId, folderId))
      .orderBy(notes.position)
      .limit(1)

    const [note] = await db
      .insert(notes)
      .values({
        id,
        userId,
        folderId,
        title,
        position: generateKeyBetween(null, first?.position ?? null),
      })
      .returning(noteColumns)
    return c.json(note, 201)
  })

  .get('/:id', async (c) => {
    const [note] = await db
      .select(noteColumns)
      .from(notes)
      .where(liveNote(c.var.userId, c.req.param('id')))
    return note ? c.json(note) : c.json(notFound, 404)
  })

  .patch('/:id', zValidator('json', updateNote), async (c) => {
    const [note] = await db
      .update(notes)
      .set(c.req.valid('json'))
      .where(liveNote(c.var.userId, c.req.param('id')))
      .returning(noteColumns)
    return note ? c.json(note) : c.json(notFound, 404)
  })

  .delete('/:id', async (c) => {
    const [note] = await db
      .update(notes)
      .set({ deletedAt: new Date() })
      .where(liveNote(c.var.userId, c.req.param('id')))
      .returning({ id: notes.id })
    return note ? c.json({ folders: 0, notes: 1 }) : c.json(notFound, 404)
  })
