import { tagElement } from '@/features/transitions/tagElement'
import { useTransitionNavigate } from '@/features/transitions/useTransitionNavigate'
import { queryClient } from '@/lib/queryClient'
import { draftNote } from './draftNote'
import { useCreateNote } from './mutations'
import { noteQuery } from './queries'

export function useNewNote(folderId: string) {
  const go = useTransitionNavigate()
  const createNote = useCreateNote()

  // source: the button that was pressed; the new note grows out of it
  return (source?: Element) => {
    const note = draftNote(folderId)
    // Seeded before navigating, so the note page never asks the server for a note that's still being created
    queryClient.setQueryData(noteQuery(note.id).queryKey, note)
    createNote.mutate(note)
    go(`/note/${note.id}`, { types: ['new-note'], before: () => tagElement(source, 'note-card') })
  }
}
