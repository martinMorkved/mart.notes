import { z } from 'zod'

export const folderName = z.string().trim().min(1, 'Mappen må ha et navn').max(80)

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
