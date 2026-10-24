import { and, eq, inArray, isNull, ne, or, sql } from 'drizzle-orm'
import { linkTargets } from '../shared/wikiLinks'
import { db } from './db'
import { noteLinks, notes } from './db/schema'

// note_links is rebuilt from a note's text each time its content is saved, so it always
// matches what the note says. Links carry the target's id; [[Title]] links are matched by title.
export async function syncOutgoing(note: { id: string; userId: string; content: string }) {
  const { ids, titles } = linkTargets(note.content)
  const matches = [
    ids.length ? inArray(notes.id, ids) : undefined,
    titles.length ? inArray(sql`lower(trim(${notes.title}))`, titles) : undefined,
  ].filter((m) => m !== undefined)

  const targets = matches.length
    ? await db
        .select({ id: notes.id })
        .from(notes)
        .where(
          and(eq(notes.userId, note.userId), isNull(notes.deletedAt), ne(notes.id, note.id), or(...matches)),
        )
    : []

  const remove = db.delete(noteLinks).where(eq(noteLinks.sourceId, note.id))
  if (!targets.length) {
    await remove
    return
  }
  const rows = targets.map((t) => ({ sourceId: note.id, targetId: t.id }))
  await db.batch([remove, db.insert(noteLinks).values(rows).onConflictDoNothing()])
}
