import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { foldersQuery } from '@/features/folders/queries'
import { plural } from '@/lib/text'
import { usePersistentState } from '@/lib/usePersistentState'
import { PageHeader } from '@/ui/PageHeader'
import { TaskNoteList } from './TaskNoteList'
import { tasksQuery } from './queries'
import { countTasks, isActive } from './visibleTasks'
import './tasks.css'

// How long a ticked task stays, struck through, before it's gone (the CSS fade fits inside)
const LEAVE_AFTER = 900

// Every checkbox from every note, the notes in the user's order of priority. Notes where
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
  // Kept between renders, since the active list holds its own order until the cache catches up
  const active = useMemo(() => notes.filter((n) => isActive(n, leaving)), [notes, leaving])
  const completed = useMemo(() => notes.filter((n) => !active.includes(n)), [notes, active])

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
        <TaskNoteList
          notes={active}
          folders={folders}
          showing={{ showAll: false, leaving }}
          onTicked={onTicked}
          doneOpen={risen}
          onRise={onRise}
          reorderable
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
            <TaskNoteList
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
