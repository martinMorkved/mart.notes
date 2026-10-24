import { combine, tagElement } from '@/features/transitions/tagElement'
import { useTransitionNavigate } from '@/features/transitions/useTransitionNavigate'
import { queryClient } from '@/lib/queryClient'
import { draftNote } from './draftNote'
import { useCreateNote } from './mutations'
import { noteQuery } from './queries'

export function useNewNote(folderId: string) {
  const go = useTransitionNavigate()
  const createNote = useCreateNote()

  return () => {
    const note = draftNote(folderId)
    // Seeded before navigating, so the note page never asks the server for a note that's still being created
    queryClient.setQueryData(noteQuery(note.id).queryKey, note)
    createNote.mutate(note)

    // The folder name becomes the note's title, and the line under it the first line to write on.
    // On the new page both names come from CSS, since the editor may replace its DOM while mounting.
    go(`/note/${note.id}`, {
      types: ['new-note'],
      before: () =>
        combine(
          tagElement(document.querySelector('[data-page-title]'), 'note-title'),
          tagElement(document.querySelector('[data-page-subtitle]'), 'note-first-line'),
        ),
    })
  }
}
