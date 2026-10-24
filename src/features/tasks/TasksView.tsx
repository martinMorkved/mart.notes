import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { foldersQuery } from '@/features/folders/queries'
import { plural } from '@/lib/text'
import { usePersistentState } from '@/lib/usePersistentState'
import { PageHeader } from '@/ui/PageHeader'
import { FolderTaskGroups } from './FolderTaskGroups'
import { tasksQuery } from './queries'
import { countTasks, isActive } from './visibleTasks'
import './tasks.css'

// How long a ticked task stays, struck through, before it's gone (the CSS fade fits inside)
const LEAVE_AFTER = 900

// Every checkbox from every note, grouped by folder in the order of the tree. Notes where
// everything is done wait at the bottom until asked for.
export function TasksView() {
  const { data: notes } = useSuspenseQuery(tasksQuery)
  const { data: folders } = useSuspenseQuery(foldersQuery)
  const [showCompleted, setShowCompleted] = usePersistentState('tasks:show-completed', false)
  const [leaving, setLeaving] = useState<Set<string>>(new Set())
  // completed notes brought back up, which keep their done tasks showing
  const [risen, setRisen] = useState<Set<string>>(new Set())
  const onRise = (noteId: string) => setRisen((set) => new Set(set).add(noteId))

  const { open, done } = countTasks(notes)
  const active = notes.filter((n) => isActive(n, leaving))
  const completed = notes.filter((n) => !active.includes(n))

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
      <PageHeader title="To-do">
        {open} open · {done} done
      </PageHeader>

      {active.length > 0 ? (
        <FolderTaskGroups
          notes={active}
          folders={folders}
          showing={{ showAll: false, leaving }}
          onTicked={onTicked}
          doneOpen={risen}
          onRise={onRise}
        />
      ) : (
        <div className="empty-state">
          <p>{notes.length ? 'Everything is done.' : 'No checkboxes in any note yet.'}</p>
        </div>
      )}

      {completed.length > 0 && (
        <div className="task-completed">
          <button className="button-quiet" onClick={() => setShowCompleted(!showCompleted)}>
            {showCompleted ? 'Hide completed notes' : `Show ${plural(completed.length, 'completed note')}`}
          </button>
          {showCompleted && (
            <FolderTaskGroups
              notes={completed}
              folders={folders}
              showing={{ showAll: true, leaving }}
              onTicked={onTicked}
              doneOpen={risen}
              onRise={onRise}
            />
          )}
        </div>
      )}
    </section>
  )
}
