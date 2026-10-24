import { and, eq, inArray, notInArray, sql } from 'drizzle-orm'
import { parseTasks } from '../shared/tasks'
import { db } from './db'
import { taskDone } from './db/schema'

const checkedTexts = (markdown: string) =>
  new Set(
    parseTasks(markdown)
      .flatMap((l) => l.tasks)
      .filter((t) => t.checked)
      .map((t) => t.text),
  )

// After a note's content changes: tasks ticked since `before` get the time now, and tasks no
// longer ticked lose theirs. Ticked in the note or on the to-do page, it's the same save.
export async function syncTaskDone(noteId: string, before: string, after: string) {
  const was = checkedTexts(before)
  const now = [...checkedTexts(after)]
  const ticked = now.filter((text) => !was.has(text))

  const forNote = eq(taskDone.noteId, noteId)
  const remove = db.delete(taskDone).where(now.length ? and(forNote, notInArray(taskDone.text, now)) : forNote)
  if (!ticked.length) {
    await remove
    return
  }
  await db.batch([
    remove,
    db
      .insert(taskDone)
      .values(ticked.map((text) => ({ noteId, text })))
      .onConflictDoUpdate({ target: [taskDone.noteId, taskDone.text], set: { doneAt: sql`now()` } }),
  ])
}

// note id → task text → when it was ticked
export async function doneTimes(noteIds: string[]) {
  const rows = noteIds.length
    ? await db.select().from(taskDone).where(inArray(taskDone.noteId, noteIds))
    : []
  const times = new Map<string, Map<string, string>>()
  for (const row of rows) {
    const note = times.get(row.noteId) ?? new Map()
    note.set(row.text, row.doneAt.toISOString())
    times.set(row.noteId, note)
  }
  return times
}
