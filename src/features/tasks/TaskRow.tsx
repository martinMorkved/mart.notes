import type { CSSProperties } from 'react'
import type { Task } from '@shared/tasks'
import { plainExcerpt } from '@/lib/text'

type Props = {
  task: Task
  // for a done sub-task shown on its own: the task it belongs under
  parent?: Task
  // just ticked, and on its way out
  leaving: boolean
  onChange: (checked: boolean) => void
}

export function TaskRow({ task, parent, leaving, onChange }: Props) {
  const text = plainExcerpt(task.text)

  return (
    <li
      className="task"
      style={{ '--depth': task.depth } as CSSProperties}
      data-checked={task.checked || undefined}
      data-leaving={(leaving && task.checked) || undefined}
    >
      <label>
        <input type="checkbox" checked={task.checked} onChange={(e) => onChange(e.target.checked)} />
        <span data-empty={!text || undefined}>
          {text || 'Empty task'}
          {parent && <small className="task-parent"> · in {plainExcerpt(parent.text) || 'Empty task'}</small>}
        </span>
      </label>
    </li>
  )
}
