import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { NoteGrid } from '@/features/notes/NoteGrid'
import { folderNotesQuery } from '@/features/notes/queries'
import { useNewNote } from '@/features/notes/useNewNote'
import { plural } from '@/lib/text'
import { PlusIcon } from '@/ui/icons'
import { PageHeader } from '@/ui/PageHeader'
import { FolderTrail } from './FolderTrail'
import { foldersQuery } from './queries'
import { ancestorsOf } from './tree'

export function FolderView() {
  const { id } = useParams() as { id: string }
  const { data: folders } = useSuspenseQuery(foldersQuery)
  const { data: notes } = useSuspenseQuery(folderNotesQuery(id))
  const newNote = useNewNote(id)
  const folder = folders.find((f) => f.id === id)
  if (!folder) return null

  return (
    <section className="page">
      <PageHeader
        title={folder.name}
        above={<FolderTrail folders={ancestorsOf(folders, id)} />}
        action={
          <button className="button-primary" onClick={newNote}>
            <PlusIcon />
            New note
          </button>
        }
      >
        {plural(notes.length, 'note')}
      </PageHeader>
      <NoteGrid notes={notes} onNewNote={newNote} />
    </section>
  )
}
