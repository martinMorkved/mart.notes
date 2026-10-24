import type { CSSProperties } from 'react'
import type { Task } from '@shared/tasks'
import { plainExcerpt } from '@/lib/text'

// leaving: just ticked, and on its way out
type Props = { task: Task; leaving: boolean; onChange: (checked: boolean) => void }

export function TaskRow({ task, leaving, onChange }: Props) {
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
        <span data-empty={!text || undefined}>{text || 'Empty task'}</span>
      </label>
    </li>
  )
}
