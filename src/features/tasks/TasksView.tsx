import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { foldersQuery } from '@/features/folders/queries'
import { ancestorsOf, flattenTree } from '@/features/folders/tree'
import { useFolderClick } from '@/features/transitions/useFolderClick'
import { usePersistentState } from '@/lib/usePersistentState'
import { PageHeader } from '@/ui/PageHeader'
import { NoteTaskLists } from './NoteTaskLists'
import { tasksQuery } from './queries'
import { countTasks, hasShownTasks, type Showing } from './visibleTasks'
import './tasks.css'

// How long a ticked task stays, struck through, before it's gone (the CSS fade fits inside)
const LEAVE_AFTER = 900

// Every checkbox from every note, grouped by folder in the order of the tree
export function TasksView() {
  const { data: notes } = useSuspenseQuery(tasksQuery)
  const { data: folders } = useSuspenseQuery(foldersQuery)
  const [showAll, setShowAll] = usePersistentState('tasks:show-completed', false)
  const [leaving, setLeaving] = useState<Set<string>>(new Set())
  const folderClick = useFolderClick()

  const showing: Showing = useMemo(() => ({ showAll, leaving }), [showAll, leaving])
  const { open, done } = countTasks(notes)
  const groups = useMemo(
    () =>
      flattenTree(folders)
        .map(({ folder }) => ({
          folder,
          notes: notes.filter((n) => n.folderId === folder.id && hasShownTasks(n, showing)),
        }))
        .filter((group) => group.notes.length),
    [notes, folders, showing],
  )

  function onTicked(key: string) {
    setLeaving((set) => new Set(set).add(key))
    setTimeout(() => {
      setLeaving((set) => {
        const next = new Set(set)
        next.delete(key)
        return next
      })
    }, LEAVE_AFTER)
  }

  return (
    <section className="page">
      <PageHeader
        title="To-do"
        action={
          done > 0 && (
            <button className="button-quiet" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Hide completed' : 'Show completed'}
            </button>
          )
        }
      >
        {open} open · {done} done
      </PageHeader>

      {groups.length ? (
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
                  <NoteTaskLists key={note.noteId} note={note} showing={showing} onTicked={onTicked} />
                ))}
              </section>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          <p>{notes.length ? 'Everything is done.' : 'No checkboxes in any note yet.'}</p>
          {done > 0 && (
            <button className="button-quiet" onClick={() => setShowAll(true)}>
              Show completed
            </button>
          )}
        </div>
      )}
    </section>
  )
}
