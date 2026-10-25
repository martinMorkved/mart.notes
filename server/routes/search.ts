import { zValidator } from '@hono/zod-validator'
import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { searchParams } from '../../shared/schemas'
import { db } from '../db'
import { folders, notes } from '../db/schema'
import { type AppEnv, requireUser } from '../env'

// Hits are wrapped in ⟦ ⟧, and the client turns them into <mark>
const marks = 'StartSel=⟦, StopSel=⟧'
const snippetOptions = `${marks}, MaxWords=24, MinWords=12, MaxFragments=1`
const titleOptions = `${marks}, HighlightAll=true`

// "oppskr pann" → "oppskr:* & pann:*", so every word matches as the start of a word.
// Only letters and digits survive, which keeps to_tsquery from choking on its own syntax.
function prefixQuery(text: string) {
  const words = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []
  return words
    .slice(0, 8)
    .map((word) => `${word}:*`)
    .join(' & ')
}

export const searchRoutes = new Hono<AppEnv>()
  .use(requireUser)

  .get('/', zValidator('query', searchParams), async (c) => {
    const terms = prefixQuery(c.req.valid('query').q)
    if (!terms) return c.json([])

    const query = sql`to_tsquery('simple', ${terms})`
    const rows = await db
      .select({
        id: notes.id,
        folderId: notes.folderId,
        folderName: folders.name,
        title: sql<string>`ts_headline('simple', ${notes.title}, ${query}, ${titleOptions})`,
        snippet: sql<string>`ts_headline('simple', ${notes.content}, ${query}, ${snippetOptions})`,
        updatedAt: notes.updatedAt,
        archived: sql<boolean>`${folders.archivedAt} is not null`,
      })
      .from(notes)
      .innerJoin(folders, eq(folders.id, notes.folderId))
      .where(and(eq(notes.userId, c.var.userId), isNull(notes.deletedAt), sql`${notes.search} @@ ${query}`))
      .orderBy(sql`ts_rank(${notes.search}, ${query}) desc`, desc(notes.updatedAt))
      .limit(30)
    return c.json(rows)
  })
