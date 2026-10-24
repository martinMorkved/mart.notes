import { useMutation } from '@tanstack/react-query'
import type { UpdateNote } from '@shared/schemas'
import type { Counts, Note, NoteSummary } from '@shared/types'
import { byPosition } from '@/features/folders/tree'
import { noteTitlesQuery } from '@/features/links/queries'
import { refreshAfterRestore, trashQuery } from '@/features/trash/queries'
import { api } from '@/lib/api'
import { positionBetween } from '@/lib/positions'
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

type MoveNoteInput = {
  note: { id: string; folderId: string; title: string }
  folderId: string
  // left out, the note goes on top of the folder
  position?: string
  // for the toast, when it changes folder
  folderName?: string
}

// The lists change in the same moment as the drop. Waiting for the mutation to run would let
// the cards slip back to the old order for a frame and then jump.
function moveInCache({ note, folderId, position }: MoveNoteInput) {
  const fromKey = folderNotesQuery(note.folderId).queryKey
  const toKey = folderNotesQuery(folderId).queryKey
  const previousFrom = queryClient.getQueryData(fromKey)
  const previousTo = queryClient.getQueryData(toKey)
  const summary = previousFrom?.find((n) => n.id === note.id)

  if (folderId === note.folderId) {
    if (position) {
      queryClient.setQueryData(fromKey, (list) =>
        list?.map((n) => (n.id === note.id ? { ...n, position } : n)).sort(byPosition),
      )
    }
  } else {
    queryClient.setQueryData(fromKey, (list) => list?.filter((n) => n.id !== note.id))
    if (previousTo && summary) {
      const top = position ?? positionBetween(undefined, [...previousTo].sort(byPosition)[0])
      queryClient.setQueryData(toKey, [...previousTo, { ...summary, folderId, position: top }].sort(byPosition))
    }
  }
  queryClient.setQueryData(noteQuery(note.id).queryKey, (n) => (n ? { ...n, folderId } : n))
  return { fromKey, toKey, previousFrom, previousTo, oldPosition: summary?.position }
}

type Undo = ReturnType<typeof moveInCache>

// Returns a function rather than the mutation, since the cache is updated before it runs
export function useMoveNote() {
  const mutation = useMutation({
    scope: noteWrites,
    mutationFn: ({ note, folderId, position }: MoveNoteInput & { undo: Undo }) =>
      api<Note>('PATCH', `/notes/${note.id}/move`, { folderId, position }),
    onSuccess: (_note, { note, folderId, folderName, undo }) => {
      if (folderId === note.folderId) return
      showToast({
        message: `Moved “${plainExcerpt(note.title) || 'Untitled'}” to ${folderName ?? 'another folder'}`,
        action: {
          label: 'Undo',
          run: () =>
            api('PATCH', `/notes/${note.id}/move`, { folderId: note.folderId, position: undo.oldPosition }).then(() => {
              queryClient.invalidateQueries({ queryKey: ['notes'] })
              queryClient.invalidateQueries({ queryKey: noteQuery(note.id).queryKey })
            }),
        },
      })
    },
    onError: (_error, { note, undo }) => {
      showToast({ message: 'Couldn’t move the note. Check your connection.' })
      queryClient.setQueryData(undo.fromKey, undo.previousFrom)
      queryClient.setQueryData(undo.toKey, undo.previousTo)
      queryClient.invalidateQueries({ queryKey: noteQuery(note.id).queryKey })
    },
    onSettled: (_data, _error, { note, folderId }) => {
      queryClient.invalidateQueries({ queryKey: folderNotesQuery(note.folderId).queryKey })
      queryClient.invalidateQueries({ queryKey: folderNotesQuery(folderId).queryKey })
      queryClient.invalidateQueries({ queryKey: noteTitlesQuery.queryKey })
    },
  })

  return (input: MoveNoteInput) => {
    // A refetch landing now would put the old order back
    queryClient.cancelQueries({ queryKey: folderNotesQuery(input.note.folderId).queryKey }, { revert: false })
    queryClient.cancelQueries({ queryKey: folderNotesQuery(input.folderId).queryKey }, { revert: false })
    mutation.mutate({ ...input, undo: moveInCache(input) })
  }
}
