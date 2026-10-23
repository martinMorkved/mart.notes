import { zValidator } from '@hono/zod-validator'
import { and, eq, isNotNull, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { idParam } from '../../shared/schemas'
import type { Counts, TrashedFolder, TrashedNote } from '../../shared/types'
import { db } from '../db'
import { folders, notes } from '../db/schema'
import { type AppEnv, requireUser } from '../env'

const validId = zValidator('param', idParam)

// A folder and its contents are trashed with the same deleted_at. That timestamp is what ties
// one deletion together, so a restore brings back exactly what disappeared at the same time.

export const trashRoutes = new Hono<AppEnv>()
  .use(requireUser)

  .get('/', async (c) => {
    const userId = c.var.userId
    const [folderRows, noteRows] = await Promise.all([
      db.execute<TrashedFolder>(sql`
        select f.id, f.name, p.name as "parentName", f.deleted_at as "deletedAt"
        from folders f left join folders p on p.id = f.parent_id
        where f.user_id = ${userId} and f.deleted_at is not null
          and p.deleted_at is distinct from f.deleted_at
        order by f.deleted_at desc
      `),
      db.execute<TrashedNote>(sql`
        select n.id, n.title, f.name as "folderName", n.deleted_at as "deletedAt"
        from notes n join folders f on f.id = n.folder_id
        where n.user_id = ${userId} and n.deleted_at is not null
          and f.deleted_at is distinct from n.deleted_at
        order by n.deleted_at desc
      `),
    ])
    return c.json({ folders: folderRows.rows, notes: noteRows.rows })
  })

  // Nothing live may sit inside a trashed folder, so the ancestors come back too
  .post('/folders/:id/restore', validId, async (c) => {
    const { rows } = await db.execute<Counts>(sql`
      with recursive target as (
        select id, parent_id, deleted_at from folders
        where id = ${c.req.param('id')} and user_id = ${c.var.userId} and deleted_at is not null
      ),
      sub as (
        select id from target
        union all
        select f.id from folders f join sub on f.parent_id = sub.id
        where f.deleted_at = (select deleted_at from target)
      ),
      anc as (
        select f.id, f.parent_id from folders f where f.id = (select parent_id from target)
        union all
        select f.id, f.parent_id from folders f join anc on f.id = anc.parent_id
      ),
      rf as (
        update folders set deleted_at = null
        where id in (select id from sub)
           or (id in (select id from anc) and deleted_at is not null)
        returning 1
      ),
      rn as (
        update notes set deleted_at = null
        where folder_id in (select id from sub) and deleted_at = (select deleted_at from target)
        returning 1
      )
      select (select count(*) from rf)::int as folders, (select count(*) from rn)::int as notes
    `)
    return rows[0].folders ? c.json(rows[0]) : c.json({ error: 'Folder not found' }, 404)
  })

  .post('/notes/:id/restore', validId, async (c) => {
    const { rows } = await db.execute<Counts>(sql`
      with recursive target as (
        select id, folder_id from notes
        where id = ${c.req.param('id')} and user_id = ${c.var.userId} and deleted_at is not null
      ),
      anc as (
        select f.id, f.parent_id from folders f where f.id = (select folder_id from target)
        union all
        select f.id, f.parent_id from folders f join anc on f.id = anc.parent_id
      ),
      rf as (
        update folders set deleted_at = null
        where id in (select id from anc) and deleted_at is not null
        returning 1
      ),
      rn as (
        update notes set deleted_at = null where id in (select id from target) returning 1
      )
      select (select count(*) from rf)::int as folders, (select count(*) from rn)::int as notes
    `)
    return rows[0].notes ? c.json(rows[0]) : c.json({ error: 'Note not found' }, 404)
  })

  .delete('/folders/:id', validId, async (c) => {
    const [row] = await db
      .delete(folders)
      .where(
        and(
          eq(folders.id, c.req.param('id')),
          eq(folders.userId, c.var.userId),
          isNotNull(folders.deletedAt),
        ),
      )
      .returning({ id: folders.id })
    return row ? c.body(null, 204) : c.json({ error: 'Folder not found' }, 404)
  })

  .delete('/notes/:id', validId, async (c) => {
    const [row] = await db
      .delete(notes)
      .where(
        and(
          eq(notes.id, c.req.param('id')),
          eq(notes.userId, c.var.userId),
          isNotNull(notes.deletedAt),
        ),
      )
      .returning({ id: notes.id })
    return row ? c.body(null, 204) : c.json({ error: 'Note not found' }, 404)
  })

  .delete('/', async (c) => {
    const userId = c.var.userId
    await db.delete(notes).where(and(eq(notes.userId, userId), isNotNull(notes.deletedAt)))
    await db.delete(folders).where(and(eq(folders.userId, userId), isNotNull(folders.deletedAt)))
    return c.body(null, 204)
  })
