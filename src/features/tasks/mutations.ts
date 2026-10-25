import { useMutation } from '@tanstack/react-query'
import type { Note, NoteTasks } from '@shared/types'
import { folderNotesQuery, noteQuery } from '@/features/notes/queries'
import { api } from '@/lib/api'
import { HttpError, queryClient } from '@/lib/queryClient'
import { showToast } from '@/ui/toast'
import { tasksQuery } from './queries'

// `subtasks`: the tasks nested under it, which the server ticks along with it
type Input = { note: NoteTasks; index: number; text: string; checked: boolean; subtasks?: number[] }

function tick(list: NoteTasks[] | undefined, { note, index, checked, subtasks = [] }: Input) {
  const changed = new Set(checked ? [index, ...subtasks] : [index])
  const doneAt = checked ? new Date().toISOString() : undefined
  return list?.map((n) =>
    n.noteId !== note.noteId
      ? n
      : {
          ...n,
          lists: n.lists.map((l) => ({
            ...l,
            tasks: l.tasks.map((t) => (changed.has(t.index) ? { ...t, checked, doneAt } : t)),
          })),
        },
  )
}

const byTodoPosition = (a: NoteTasks, b: NoteTasks) => (a.todoPosition < b.todoPosition ? -1 : 1)

// A note's new place in the priority order of the to-do page
export function useMoveTaskNote() {
  return useMutation({
    mutationFn: ({ noteId, todoPosition }: { noteId: string; todoPosition: string }) =>
      api('PATCH', `/tasks/notes/${noteId}/position`, { position: todoPosition }),
    onMutate: async ({ noteId, todoPosition }) => {
      await queryClient.cancelQueries({ queryKey: tasksQuery.queryKey })
      const previous = queryClient.getQueryData(tasksQuery.queryKey)
      queryClient.setQueryData(tasksQuery.queryKey, (list) =>
        list?.map((n) => (n.noteId === noteId ? { ...n, todoPosition } : n)).sort(byTodoPosition),
      )
      return { previous }
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(tasksQuery.queryKey, context?.previous)
      showToast({ message: 'Couldn’t move the note. Check your connection.' })
    },
  })
}

export function useSetTask() {
  return useMutation({
    // One at a time: each tick reads the note and writes it back, so two at once could undo one
    scope: { id: 'task-writes' },
    mutationFn: ({ note, index, text, checked }: Input) =>
      api<Pick<Note, 'content' | 'updatedAt'>>('PATCH', `/tasks/${note.noteId}/${index}`, { text, checked }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: tasksQuery.queryKey })
      const previous = queryClient.getQueryData(tasksQuery.queryKey)
      queryClient.setQueryData(tasksQuery.queryKey, (list) => tick(list, input))
      return { previous }
    },
    onSuccess: (saved, { note }) => {
      // An open copy of the note gets the new text, so it doesn't save the old box back
      queryClient.setQueryData(noteQuery(note.noteId).queryKey, (n) => (n ? { ...n, ...saved } : n))
      queryClient.invalidateQueries({ queryKey: folderNotesQuery(note.folderId).queryKey })
    },
    onError: (error, _input, context) => {
      queryClient.setQueryData(tasksQuery.queryKey, context?.previous)
      const changed = error instanceof HttpError && error.status === 409
      showToast({ message: changed ? error.message : 'Couldn’t save the change. Check your connection.' })
      if (changed) queryClient.invalidateQueries({ queryKey: tasksQuery.queryKey })
    },
  })
}
