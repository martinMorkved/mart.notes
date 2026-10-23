import { useNavigate } from 'react-router'
import { draftNote } from './draftNote'
import { useCreateNote } from './mutations'

export function useNewNote(folderId: string) {
  const navigate = useNavigate()
  const createNote = useCreateNote()

  return () => {
    const note = draftNote(folderId)
    createNote.mutate(note)
    navigate(`/note/${note.id}`)
  }
}
