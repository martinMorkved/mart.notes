import { Link } from 'react-router'
import { subtasksOf, type Task } from '@shared/tasks'
import type { NoteTasks } from '@shared/types'
import { linkedNote } from '@/features/transitions/linkedNote'
import { preload } from '@/features/transitions/preload'
import { useTransitionClick } from '@/features/transitions/useTransitionClick'
import { plainExcerpt } from '@/lib/text'
import { showToast } from '@/ui/toast'
import { useSetTask } from './mutations'
import { riseIntoPlace } from './riseIntoPlace'
import { TaskListBlock } from './TaskListBlock'
import { type Showing, taskKey } from './visibleTasks'

type Props = {
  note: NoteTasks
  showing: Showing
  onTicked: (key: string) => void
  // a note that came back from the completed ones starts with its done tasks showing
  doneOpen: boolean
  onRise: (noteId: string) => void
}

// One note's checklists, each under the heading it has in the note
export function NoteTaskLists({ note, showing, onTicked, doneOpen, onRise }: Props) {
  const setTask = useSetTask()
  const click = useTransitionClick()
  const to = `/note/${note.noteId}`

  const isLeaving = (task: Task) => task.checked && showing.leaving.has(taskKey(note.noteId, task.index))

  // `hides`: the task's list keeps its done tasks hidden, so a ticked one slides away
  function change(shown: Task, checked: boolean, hides: boolean) {
    // The rows are drawn at their own depth; nesting is looked up in the note's list
    const list = note.lists.find((l) => l.tasks.some((t) => t.index === shown.index))!
    const task = list.tasks.find((t) => t.index === shown.index)!
    const set = (t: Task, value: boolean, subtasks?: number[]) =>
      setTask.mutate({ note, index: t.index, text: t.text, checked: value, subtasks })

    if (!checked) {
      // Unticking in a note where everything was done brings the card back up the page
      const completed = note.lists.every((l) => l.tasks.every((t) => t.checked))
      if (!completed) return set(task, false)
      // The rest of what's done stays in view, in case more of it should be opened again
      return riseIntoPlace(note.noteId, () => {
        onRise(note.noteId)
        set(task, false)
      })
    }

    // Ticking a task finishes what's under it too; undo opens again what was open before
    const opened = subtasksOf(list.tasks, task).filter((t) => !t.checked)
    set(task, true, opened.map((t) => t.index))
    if (hides) [task, ...opened].forEach((t) => onTicked(taskKey(note.noteId, t.index)))
    showToast({
      message: `Completed “${plainExcerpt(task.text) || 'Empty task'}”`,
      action: { label: 'Undo', run: () => [task, ...opened].forEach((t) => set(t, false)) },
    })
  }

  return (
    <article className="task-note" data-task-note={note.noteId}>
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
          doneOpen={doneOpen}
          isLeaving={isLeaving}
          onChange={change}
        />
      ))}
    </article>
  )
}
