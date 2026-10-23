import { zValidator } from '@hono/zod-validator'
import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import { generateKeyBetween } from 'fractional-indexing'
import { Hono } from 'hono'
import { createFolder, updateFolder } from '../../shared/schemas'
import type { Counts } from '../../shared/types'
import { db } from '../db'
import { folders, notes } from '../db/schema'
import { type AppEnv, requireUser } from '../env'

export const folderColumns = {
  id: folders.id,
  parentId: folders.parentId,
  name: folders.name,
  position: folders.position,
}

export const noteSummaryColumns = {
  id: notes.id,
  folderId: notes.folderId,
  title: notes.title,
  excerpt: sql<string>`left(${notes.content}, 280)`,
  position: notes.position,
  updatedAt: notes.updatedAt,
}

export function liveFolder(userId: string, id: string) {
  return and(eq(folders.id, id), eq(folders.userId, userId), isNull(folders.deletedAt))
}

export async function ownsFolder(userId: string, id: string) {
  const [row] = await db.select({ id: folders.id }).from(folders).where(liveFolder(userId, id))
  return Boolean(row)
}

const notFound = { error: 'Fant ikke mappen' }

export const folderRoutes = new Hono<AppEnv>()
  .use(requireUser)

  .get('/', async (c) => {
    const rows = await db
      .select(folderColumns)
      .from(folders)
      .where(and(eq(folders.userId, c.var.userId), isNull(folders.deletedAt)))
      .orderBy(folders.position)
    return c.json(rows)
  })

  .post('/', zValidator('json', createFolder), async (c) => {
    const { id, parentId, name } = c.req.valid('json')
    const userId = c.var.userId
    if (parentId && !(await ownsFolder(userId, parentId))) return c.json(notFound, 404)

    // Slettede søsken tas med, så en gjenopprettet mappe ikke kolliderer på posisjon
    const [last] = await db
      .select({ position: folders.position })
      .from(folders)
      .where(
        and(
          eq(folders.userId, userId),
          parentId ? eq(folders.parentId, parentId) : isNull(folders.parentId),
        ),
      )
      .orderBy(desc(folders.position))
      .limit(1)

    const [folder] = await db
      .insert(folders)
      .values({
        id,
        userId,
        parentId,
        name,
        position: generateKeyBetween(last?.position ?? null, null),
      })
      .returning(folderColumns)
    return c.json(folder, 201)
  })

  .patch('/:id', zValidator('json', updateFolder), async (c) => {
    const [folder] = await db
      .update(folders)
      .set(c.req.valid('json'))
      .where(liveFolder(c.var.userId, c.req.param('id')))
      .returning(folderColumns)
    return folder ? c.json(folder) : c.json(notFound, 404)
  })

  .delete('/:id', async (c) => {
    const { rows } = await db.execute<Counts>(sql`
      with recursive tree as (
        select id from folders
        where id = ${c.req.param('id')} and user_id = ${c.var.userId} and deleted_at is null
        union all
        select f.id from folders f join tree on f.parent_id = tree.id
        where f.deleted_at is null
      ),
      f as (
        update folders set deleted_at = now() where id in (select id from tree) returning 1
      ),
      n as (
        update notes set deleted_at = now()
        where folder_id in (select id from tree) and deleted_at is null returning 1
      )
      select (select count(*) from f)::int as folders, (select count(*) from n)::int as notes
    `)
    return rows[0].folders ? c.json(rows[0]) : c.json(notFound, 404)
  })

  .get('/:id/notes', async (c) => {
    const id = c.req.param('id')
    if (!(await ownsFolder(c.var.userId, id))) return c.json(notFound, 404)
    const rows = await db
      .select(noteSummaryColumns)
      .from(notes)
      .where(and(eq(notes.folderId, id), isNull(notes.deletedAt)))
      .orderBy(notes.position)
    return c.json(rows)
  })
