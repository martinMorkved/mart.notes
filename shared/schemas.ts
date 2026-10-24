import { z } from 'zod'

export const folderName = z.string().trim().min(1, 'Folder name is required').max(80)

export const createFolder = z.object({
  id: z.uuid().optional(),
  parentId: z.uuid().nullable(),
  name: folderName,
})

export const updateFolder = z.object({
  name: folderName,
})

export const createNote = z.object({
  id: z.uuid().optional(),
  folderId: z.uuid(),
  title: z.string().max(200).default(''),
})

export const updateNote = z
  .object({
    title: z.string().max(200),
    content: z.string().max(200_000),
  })
  .partial()

export type CreateFolder = z.infer<typeof createFolder>
export type UpdateFolder = z.infer<typeof updateFolder>
export type CreateNote = z.input<typeof createNote>
export type UpdateNote = z.infer<typeof updateNote>

export const idParam = z.object({ id: z.uuid() })

export const searchParams = z.object({ q: z.string().max(200) })

// A fractional-indexing key, placed between two neighbours by the client
const position = z.string().regex(/^[0-9A-Za-z]{1,64}$/)

// Without a position, the note goes on top of its new folder
export const moveNote = z.object({
  folderId: z.uuid(),
  position: position.optional(),
})

export const moveFolder = z.object({
  parentId: z.uuid().nullable(),
  position,
})

export type MoveNote = z.infer<typeof moveNote>
export type MoveFolder = z.infer<typeof moveFolder>
