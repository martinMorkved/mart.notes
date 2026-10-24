import { Link } from 'react-router'
import type { Folder, NoteTasks } from '@shared/types'
import { ancestorsOf, flattenTree } from '@/features/folders/tree'
import { useFolderClick } from '@/features/transitions/useFolderClick'
import { NoteTaskLists } from './NoteTaskLists'
import type { Showing } from './visibleTasks'

type Props = {
  notes: NoteTasks[]
  folders: Folder[]
  showing: Showing
  onTicked: (key: string) => void
  // notes whose done tasks start out showing
  doneOpen: Set<string>
  onRise: (noteId: string) => void
}

// Notes under their folders, the folders in the order of the tree
export function FolderTaskGroups({ notes, folders, showing, onTicked, doneOpen, onRise }: Props) {
  const folderClick = useFolderClick()
  const groups = flattenTree(folders)
    .map(({ folder }) => ({ folder, notes: notes.filter((n) => n.folderId === folder.id) }))
    .filter((group) => group.notes.length)

  return (
    <div className="task-groups">
      {groups.map(({ folder, notes }) => {
        const trail = ancestorsOf(folders, folder.id)
        return (
          <section key={folder.id} className="task-folder">
            <h2>
              {trail.length > 0 && <span className="task-trail">{trail.map((f) => f.name).join(' / ')} /</span>}
              <Link to={`/folder/${folder.id}`} onClick={folderClick(folder.id)}>
                <span data-folder-label>{folder.name}</span>
              </Link>
            </h2>
            {notes.map((note) => (
              <NoteTaskLists
                key={note.noteId}
                note={note}
                showing={showing}
                onTicked={onTicked}
                doneOpen={doneOpen.has(note.noteId)}
                onRise={onRise}
              />
            ))}
          </section>
        )
      })}
    </div>
  )
}
