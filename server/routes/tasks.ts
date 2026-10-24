import { zValidator } from '@hono/zod-validator'
import { and, eq, isNull, or, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { setTaskBody } from '../../shared/schemas'
import { parseTasks, setTask } from '../../shared/tasks'
import type { NoteTasks } from '../../shared/types'
import { db } from '../db'
import { notes } from '../db/schema'
import { type AppEnv, requireUser } from '../env'
import { doneTimes, syncTaskDone } from '../taskDone'

const taskParams = z.object({ id: z.uuid(), index: z.coerce.number().int().min(0) })

export const taskRoutes = new Hono<AppEnv>()
  .use(requireUser)

  // Every note with checkboxes, and its lists of tasks
  .get('/', async (c) => {
    const rows = await db
      .select({
        noteId: notes.id,
        title: notes.title,
        folderId: notes.folderId,
        position: notes.position,
        content: notes.content,
      })
      .from(notes)
      .where(
        and(
          eq(notes.userId, c.var.userId),
          isNull(notes.deletedAt),
          // Only narrows it down; the parser decides what's really a task
          or(sql`${notes.content} like '%[ ]%'`, sql`lower(${notes.content}) like '%[x]%'`),
        ),
      )
      .orderBy(notes.position)

    const times = await doneTimes(rows.map((r) => r.noteId))
    const result: NoteTasks[] = rows
      .map(({ content, ...note }) => {
        const done = times.get(note.noteId)
        const lists = parseTasks(content).map((list) => ({
          ...list,
          tasks: list.tasks.map((t) => (t.checked && done?.has(t.text) ? { ...t, doneAt: done.get(t.text) } : t)),
        }))
        return { ...note, lists }
      })
      .filter((note) => note.lists.length)
    return c.json(result)
  })

  // Ticks or unticks one task. The task's text comes along, so a note edited since the page
  // loaded isn't changed on the wrong line.
  .patch('/:id/:index', zValidator('param', taskParams), zValidator('json', setTaskBody), async (c) => {
    const { id, index } = c.req.valid('param')
    const { text, checked } = c.req.valid('json')
    const live = and(eq(notes.id, id), eq(notes.userId, c.var.userId), isNull(notes.deletedAt))

    const [note] = await db.select({ content: notes.content }).from(notes).where(live)
    if (!note) return c.json({ error: 'Note not found' }, 404)
    const content = setTask(note.content, index, text, checked)
    if (content === null) return c.json({ error: 'The note has changed. Reload to see it.' }, 409)

    const [saved] = await db
      .update(notes)
      .set({ content })
      .where(live)
      .returning({ content: notes.content, updatedAt: notes.updatedAt })
    await syncTaskDone(id, note.content, content)
    return c.json(saved)
  })
