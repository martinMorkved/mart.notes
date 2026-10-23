import { queryOptions } from '@tanstack/react-query'
import type { Note, NoteSummary } from '@shared/types'
import { api } from '@/lib/api'

export const folderNotesQuery = (folderId: string) =>
  queryOptions({
    queryKey: ['notes', folderId],
    queryFn: () => api<NoteSummary[]>('GET', `/folders/${folderId}/notes`),
  })

export const noteQuery = (id: string) =>
  queryOptions({
    queryKey: ['note', id],
    queryFn: () => api<Note>('GET', `/notes/${id}`),
  })
