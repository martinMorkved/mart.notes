import { sql } from 'drizzle-orm'
import {
  type AnyPgColumn,
  boolean,
  customType,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

// fractional-indexing sorterer etter tegnkode, så kolonnen trenger C-kollasjon
const sortKey = customType<{ data: string }>({
  dataType: () => 'text collate "C"',
})

const tsvector = customType<{ data: string }>({
  dataType: () => 'tsvector',
})

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

// Better Auth

export const user = pgTable('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  ...timestamps,
})

export const session = pgTable(
  'session',
  {
    id: text().primaryKey(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    token: text().notNull().unique(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (t) => [index().on(t.userId)],
)

export const account = pgTable(
  'account',
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    password: text(),
    ...timestamps,
  },
  (t) => [index().on(t.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    ...timestamps,
  },
  (t) => [index().on(t.identifier)],
)

// Appen

export const folders = pgTable(
  'folders',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    parentId: uuid().references((): AnyPgColumn => folders.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    position: sortKey().notNull(),
    deletedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index('folders_tree_idx').on(t.userId, t.parentId).where(sql`deleted_at is null`),
    index('folders_trash_idx').on(t.userId, t.deletedAt).where(sql`deleted_at is not null`),
  ],
)

export const notes = pgTable(
  'notes',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    folderId: uuid()
      .notNull()
      .references(() => folders.id, { onDelete: 'cascade' }),
    title: text().notNull().default(''),
    content: text().notNull().default(''),
    position: sortKey().notNull(),
    deletedAt: timestamp({ withTimezone: true }),
    ...timestamps,
    search: tsvector().generatedAlwaysAs(
      sql`setweight(to_tsvector('norwegian', title), 'A') || setweight(to_tsvector('norwegian', content), 'B')`,
    ),
  },
  (t) => [
    index('notes_folder_idx').on(t.folderId).where(sql`deleted_at is null`),
    index('notes_trash_idx').on(t.userId, t.deletedAt).where(sql`deleted_at is not null`),
    index('notes_search_idx').using('gin', t.search),
  ],
)

export const tags = pgTable(
  'tags',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    color: text().notNull(),
  },
  (t) => [uniqueIndex('tags_user_name_idx').on(t.userId, t.name)],
)

export const noteTags = pgTable(
  'note_tags',
  {
    noteId: uuid()
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    tagId: uuid()
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.noteId, t.tagId] }), index().on(t.tagId)],
)

export const noteLinks = pgTable(
  'note_links',
  {
    sourceId: uuid()
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    targetId: uuid()
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.sourceId, t.targetId] }), index().on(t.targetId)],
)
