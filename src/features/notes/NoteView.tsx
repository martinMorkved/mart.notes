import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { foldersQuery } from '@/features/folders/queries'
import { NoteDocument } from './NoteDocument'
import { noteQuery } from './queries'

export function NoteView() {
  const { id } = useParams() as { id: string }
  const { data: note } = useSuspenseQuery(noteQuery(id))
  const { data: folders } = useSuspenseQuery(foldersQuery)
  const folderName = folders.find((f) => f.id === note.folderId)?.name ?? 'Back'

  return <NoteDocument key={note.id} note={note} folderName={folderName} />
}
