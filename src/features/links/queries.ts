import { queryOptions } from '@tanstack/react-query'
import type { Backlink, NoteTitle } from '@shared/types'
import { api } from '@/lib/api'

// Under 'notes', so everything that refreshes the note lists refreshes this too
export const noteTitlesQuery = queryOptions({
  queryKey: ['notes', 'titles'],
  queryFn: () => api<NoteTitle[]>('GET', '/notes/titles'),
})

export const backlinksQuery = (noteId: string) =>
  queryOptions({
    queryKey: ['backlinks', noteId],
    queryFn: () => api<Backlink[]>('GET', `/notes/${noteId}/backlinks`),
    // Other notes decide what links here, so it's checked again each time the note opens
    staleTime: 0,
  })
