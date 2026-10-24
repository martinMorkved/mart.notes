import { zValidator } from '@hono/zod-validator'
import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import { generateKeyBetween } from 'fractional-indexing'
import { Hono } from 'hono'
import { createNote, idParam, moveNote, updateNote } from '../../shared/schemas'
import { db } from '../db'
import { folders, noteLinks, notes } from '../db/schema'
import { type AppEnv, requireUser } from '../env'
import { syncOutgoing } from '../links'
import { syncTaskDone } from '../taskDone'
import { ownsFolder } from './folders'

const validId = zValidator('param', idParam)

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
const folderNotFound = { error: 'Folder not found' }

// A position above every note in the folder, trashed ones too, so a restore can't collide
async function topPosition(folderId: string) {
  const [first] = await db
    .select({ position: notes.position })
    .from(notes)
    .where(eq(notes.folderId, folderId))
    .orderBy(notes.position)
    .limit(1)
  return generateKeyBetween(null, first?.position ?? null)
}

export const noteRoutes = new Hono<AppEnv>()
  .use(requireUser)

  .post('/', zValidator('json', createNote), async (c) => {
    const { id, folderId, title } = c.req.valid('json')
    const userId = c.var.userId
    if (!(await ownsFolder(userId, folderId))) return c.json(folderNotFound, 404)

    // New notes go on top
    const [note] = await db
      .insert(notes)
      .values({ id, userId, folderId, title, position: await topPosition(folderId) })
      .returning(noteColumns)
    return c.json(note, 201)
  })

  // Every live note's title, for link suggestions and for showing links by the current title
  .get('/titles', async (c) => {
    const rows = await db
      .select({ id: notes.id, title: notes.title, folderId: notes.folderId })
      .from(notes)
      .where(and(eq(notes.userId, c.var.userId), isNull(notes.deletedAt)))
      .orderBy(desc(notes.updatedAt))
    return c.json(rows)
  })

  .get('/:id/backlinks', validId, async (c) => {
    const rows = await db
      .select({ id: notes.id, title: notes.title, folderName: folders.name })
      .from(noteLinks)
      .innerJoin(notes, eq(notes.id, noteLinks.sourceId))
      .innerJoin(folders, eq(folders.id, notes.folderId))
      .where(
        and(eq(noteLinks.targetId, c.req.param('id')), eq(notes.userId, c.var.userId), isNull(notes.deletedAt)),
      )
      .orderBy(desc(notes.updatedAt))
    return c.json(rows)
  })

  .get('/:id', validId, async (c) => {
    const [note] = await db
      .select(noteColumns)
      .from(notes)
      .where(liveNote(c.var.userId, c.req.param('id')))
    return note ? c.json(note) : c.json(notFound, 404)
  })

  .patch('/:id', validId, zValidator('json', updateNote), async (c) => {
    const patch = c.req.valid('json')
    const userId = c.var.userId
    const id = c.req.param('id')
    // The text from before, to see which checkboxes were ticked in this save
    const [before] =
      patch.content !== undefined
        ? await db.select({ content: notes.content }).from(notes).where(liveNote(userId, id))
        : []
    const [note] = await db.update(notes).set(patch).where(liveNote(userId, id)).returning(noteColumns)
    if (!note) return c.json(notFound, 404)

    if (patch.content !== undefined) {
      await Promise.all([
        syncOutgoing({ ...note, userId }),
        before && syncTaskDone(note.id, before.content, note.content),
      ])
    }
    return c.json(note)
  })

  .patch('/:id/move', validId, zValidator('json', moveNote), async (c) => {
    const { folderId, position } = c.req.valid('json')
    const userId = c.var.userId
    if (!(await ownsFolder(userId, folderId))) return c.json(folderNotFound, 404)

    const [note] = await db
      .update(notes)
      // Moving isn't editing, so the date on the card stays
      .set({ folderId, position: position ?? (await topPosition(folderId)), updatedAt: sql`${notes.updatedAt}` })
      .where(liveNote(userId, c.req.param('id')))
      .returning(noteColumns)
    return note ? c.json(note) : c.json(notFound, 404)
  })

  .delete('/:id', validId, async (c) => {
    const [note] = await db
      .update(notes)
      .set({ deletedAt: new Date() })
      .where(liveNote(c.var.userId, c.req.param('id')))
      .returning({ id: notes.id })
    return note ? c.json({ folders: 0, notes: 1 }) : c.json(notFound, 404)
  })
