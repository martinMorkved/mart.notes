import { useState } from 'react'
import type { Task, TaskList } from '@shared/tasks'
import { TaskRow } from './TaskRow'

type Props = {
  list: TaskList
  // "Show completed" for the whole page
  showAll: boolean
  isLeaving: (task: Task) => boolean
  onChange: (task: Task, checked: boolean, hides: boolean) => void
}

// A list's name, its open tasks, and right under them its done ones, which each list shows
// or hides on its own
export function TaskListBlock({ list, showAll, isLeaving, onChange }: Props) {
  const [showDone, setShowDone] = useState(false)

  // A task on its way out stays among the open ones until it's gone
  const open = list.tasks.filter((t) => !t.checked || isLeaving(t))
  const done = list.tasks.filter((t) => t.checked && !isLeaving(t))
  const doneShown = showAll || showDone

  const rows = (tasks: Task[]) =>
    tasks.map((task) => (
      <TaskRow
        key={task.index}
        task={task}
        leaving={isLeaving(task)}
        onChange={(checked) => onChange(task, checked, !doneShown)}
      />
    ))

  return (
    <div className="task-list">
      {list.heading && <h4>{list.heading}</h4>}
      {open.length > 0 && <ul>{rows(open)}</ul>}
      {doneShown && done.length > 0 && <ul className="task-list-done">{rows(done)}</ul>}
      {done.length > 0 && !showAll && (
        <button className="task-done-toggle" onClick={() => setShowDone(!showDone)}>
          {showDone ? 'Hide done' : `Show ${done.length} done`}
        </button>
      )}
    </div>
  )
}
