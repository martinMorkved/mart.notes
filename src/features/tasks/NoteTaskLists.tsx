import { Link } from 'react-router'
import type { Task } from '@shared/tasks'
import type { NoteTasks } from '@shared/types'
import { linkedNote } from '@/features/transitions/linkedNote'
import { preload } from '@/features/transitions/preload'
import { useTransitionClick } from '@/features/transitions/useTransitionClick'
import { plainExcerpt } from '@/lib/text'
import { showToast } from '@/ui/toast'
import { useSetTask } from './mutations'
import { TaskListBlock } from './TaskListBlock'
import { type Showing, taskKey } from './visibleTasks'

type Props = { note: NoteTasks; showing: Showing; onTicked: (key: string) => void }

// One note's checklists, each under the heading it has in the note
export function NoteTaskLists({ note, showing, onTicked }: Props) {
  const setTask = useSetTask()
  const click = useTransitionClick()
  const to = `/note/${note.noteId}`

  const isLeaving = (task: Task) => task.checked && showing.leaving.has(taskKey(note.noteId, task.index))

  // `hides`: the task's list keeps its done tasks hidden, so a ticked one slides away
  function change(task: Task, checked: boolean, hides: boolean) {
    setTask.mutate({ note, index: task.index, text: task.text, checked })
    if (!checked) return
    if (hides) onTicked(taskKey(note.noteId, task.index))
    showToast({
      message: `Completed “${plainExcerpt(task.text) || 'Empty task'}”`,
      action: {
        label: 'Undo',
        run: () => setTask.mutate({ note, index: task.index, text: task.text, checked: false }),
      },
    })
  }

  return (
    <article className="task-note">
      <h3>
        <Link to={to} onPointerEnter={() => preload(to)} onFocus={() => preload(to)} onClick={click(to, linkedNote)}>
          {note.title || 'Untitled'}
        </Link>
      </h3>
      {note.lists.map((list) => (
        <TaskListBlock
          key={list.tasks[0].index}
          list={list}
          showAll={showing.showAll}
          isLeaving={isLeaving}
          onChange={change}
        />
      ))}
    </article>
  )
}
