import { eq, sql } from 'drizzle-orm'
import { generateNKeysBetween } from 'fractional-indexing'
import { db } from './db'
import { folders, notes } from './db/schema'

type Row = { noteId: string; folderId: string; position: string; todoPosition: string | null }

// Each folder's place when the whole tree is read from top to bottom
async function treeRanks(userId: string) {
  const rows = await db
    .select({ id: folders.id, parentId: folders.parentId, position: folders.position })
    .from(folders)
    .where(eq(folders.userId, userId))
  const children = new Map<string | null, typeof rows>()
  for (const row of rows) children.set(row.parentId, [...(children.get(row.parentId) ?? []), row])

  const ranks = new Map<string, number>()
  const walk = (parentId: string | null) => {
    const level = (children.get(parentId) ?? []).sort((a, b) => (a.position < b.position ? -1 : 1))
    for (const folder of level) {
      ranks.set(folder.id, ranks.size)
      walk(folder.id)
    }
  }
  walk(null)
  return ranks
}

// Notes that have just got checkboxes go to the bottom of the to-do page. Several at once
// (the first time the page is opened, every note) keep the order of the folder tree, which is
// how the page used to be sorted. Fills in `todoPosition` on the rows it places.
export async function placeNewTodoNotes(userId: string, rows: Row[]) {
  const unplaced = rows.filter((r) => r.todoPosition === null)
  if (!unplaced.length) return

  const ranks = await treeRanks(userId)
  const rank = (r: Row) => ranks.get(r.folderId) ?? Infinity
  unplaced.sort((a, b) => rank(a) - rank(b) || (a.position < b.position ? -1 : 1))

  // After every placed note, also ones not in `rows` right now (all done, or archived)
  const [{ last }] = await db
    .select({ last: sql<string | null>`max(${notes.todoPosition})` })
    .from(notes)
    .where(eq(notes.userId, userId))
  const keys = generateNKeysBetween(last, null, unplaced.length)

  await Promise.all(
    unplaced.map((row, i) => {
      row.todoPosition = keys[i]
      return db
        .update(notes)
        .set({ todoPosition: keys[i], updatedAt: sql`${notes.updatedAt}` })
        .where(eq(notes.id, row.noteId))
    }),
  )
}
