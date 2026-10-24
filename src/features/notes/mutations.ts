import { useMutation } from '@tanstack/react-query'
import type { UpdateNote } from '@shared/schemas'
import type { Counts, Note, NoteSummary } from '@shared/types'
import { noteTitlesQuery } from '@/features/links/queries'
import { refreshAfterRestore, trashQuery } from '@/features/trash/queries'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import { plainExcerpt } from '@/lib/text'
import { showToast } from '@/ui/toast'
import { folderNotesQuery, noteQuery } from './queries'

const noteWrites = { id: 'note-writes' }

export function useCreateNote() {
  return useMutation({
    scope: noteWrites,
    mutationFn: (note: Note) =>
      api<Note>('POST', '/notes', { id: note.id, folderId: note.folderId, title: note.title }),
    onMutate: async (note) => {
      const key = folderNotesQuery(note.folderId).queryKey
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData(key)
      const summary: NoteSummary = { ...note, excerpt: '' }
      queryClient.setQueryData(key, (list = []) => [summary, ...list])
      queryClient.setQueryData(noteQuery(note.id).queryKey, note)
      return { previous, key }
    },
    onError: (_error, note, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous)
      queryClient.removeQueries({ queryKey: noteQuery(note.id).queryKey })
    },
    onSettled: (_data, _error, note) => {
      queryClient.invalidateQueries({ queryKey: folderNotesQuery(note.folderId).queryKey })
      queryClient.invalidateQueries({ queryKey: noteTitlesQuery.queryKey })
    },
  })
}

export function useUpdateNote() {
  return useMutation({
    scope: noteWrites,
    mutationFn: ({ id, patch }: { id: string; folderId: string; patch: UpdateNote }) =>
      // keepalive lets the last save finish when the tab closes; browsers cap it at 64 kB
      api<Note>('PATCH', `/notes/${id}`, patch, { keepalive: JSON.stringify(patch).length < 60_000 }),
    onMutate: ({ id, folderId, patch }) => {
      const updatedAt = new Date().toISOString()
      queryClient.setQueryData(noteQuery(id).queryKey, (note) =>
        note ? { ...note, ...patch, updatedAt } : note,
      )
      queryClient.setQueryData(folderNotesQuery(folderId).queryKey, (list) =>
        list?.map((n) =>
          n.id === id
            ? {
                ...n,
                updatedAt,
                ...(patch.title !== undefined && { title: patch.title }),
                ...(patch.content !== undefined && { excerpt: patch.content.slice(0, 280) }),
              }
            : n,
        ),
      )
      if (patch.title !== undefined) {
        const title = patch.title
        queryClient.setQueryData(noteTitlesQuery.queryKey, (list) =>
          list?.map((n) => (n.id === id ? { ...n, title } : n)),
        )
      }
    },
    onSuccess: (_note, { patch }) => {
      if (patch.title !== undefined) queryClient.invalidateQueries({ queryKey: noteTitlesQuery.queryKey })
    },
    onError: (_error, { id, folderId }) => {
      showToast({ message: 'Couldn’t save the note. Check your connection.' })
      queryClient.invalidateQueries({ queryKey: noteQuery(id).queryKey })
      queryClient.invalidateQueries({ queryKey: folderNotesQuery(folderId).queryKey })
    },
  })
}

export function useDeleteNote() {
  return useMutation({
    scope: noteWrites,
    mutationFn: (note: { id: string; folderId: string; title: string }) =>
      api<Counts>('DELETE', `/notes/${note.id}`),
    onMutate: async (note) => {
      const key = folderNotesQuery(note.folderId).queryKey
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData(key)
      queryClient.setQueryData(key, (list) => list?.filter((n) => n.id !== note.id))
      return { previous, key }
    },
    onSuccess: (_counts, note) => {
      queryClient.removeQueries({ queryKey: noteQuery(note.id).queryKey })
      showToast({
        message: `Moved “${plainExcerpt(note.title) || 'Untitled'}” to trash`,
        action: {
          label: 'Undo',
          run: () => api('POST', `/trash/notes/${note.id}/restore`).then(refreshAfterRestore),
        },
      })
    },
    onError: (_error, _note, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: trashQuery.queryKey })
      queryClient.invalidateQueries({ queryKey: noteTitlesQuery.queryKey })
    },
  })
}
