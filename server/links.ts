import { and, eq, inArray, isNull, ne, type SQL, sql } from 'drizzle-orm'
import { linkTargets, titleKey } from '../shared/wikiLinks'
import { db } from './db'
import { noteLinks, notes } from './db/schema'

// note_links is rebuilt from the text, so it always matches what the notes say. A note's own
// links change with its content, and the links to it change with its title.

type Saved = { id: string; userId: string; title: string; content: string }

export async function syncOutgoing(note: Saved) {
  const keys = [...linkTargets(note.content)]
  const targets = keys.length
    ? await db
        .select({ id: notes.id })
        .from(notes)
        .where(
          and(
            eq(notes.userId, note.userId),
            isNull(notes.deletedAt),
            ne(notes.id, note.id),
            inArray(sql`lower(trim(${notes.title}))`, keys),
          ),
        )
    : []
  await replaceLinks(
    eq(noteLinks.sourceId, note.id),
    targets.map((t) => ({ sourceId: note.id, targetId: t.id })),
  )
}

export async function syncIncoming(note: Saved) {
  const key = titleKey(note.title)
  // The LIKE only narrows it down; the real check is parsing each candidate's links
  const pattern = `%[[${key.replace(/[\\%_]/g, '\\$&')}%`
  const candidates = key
    ? await db
        .select({ id: notes.id, content: notes.content })
        .from(notes)
        .where(
          and(
            eq(notes.userId, note.userId),
            isNull(notes.deletedAt),
            ne(notes.id, note.id),
            sql`lower(${notes.content}) like ${pattern}`,
          ),
        )
    : []
  await replaceLinks(
    eq(noteLinks.targetId, note.id),
    candidates
      .filter((c) => linkTargets(c.content).has(key))
      .map((c) => ({ sourceId: c.id, targetId: note.id })),
  )
}

async function replaceLinks(which: SQL, rows: (typeof noteLinks.$inferInsert)[]) {
  const remove = db.delete(noteLinks).where(which)
  if (!rows.length) {
    await remove
    return
  }
  await db.batch([remove, db.insert(noteLinks).values(rows).onConflictDoNothing()])
}
