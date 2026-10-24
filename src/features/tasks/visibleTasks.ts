import type { Task } from '@shared/tasks'
import type { NoteTasks } from '@shared/types'

export const taskKey = (noteId: string, index: number) => `${noteId}:${index}`

// Done tasks are hidden, like in Todoist, unless they're asked for. One just ticked stays a
// moment longer, while it slides away.
export type Showing = { showAll: boolean; leaving: Set<string> }

function isShown(note: NoteTasks, task: Task, { showAll, leaving }: Showing) {
  return !task.checked || showAll || leaving.has(taskKey(note.noteId, task.index))
}

// A note is listed while it has something to show; one where everything's done waits for
// "Show completed"
export function hasShownTasks(note: NoteTasks, showing: Showing) {
  return note.lists.some((list) => list.tasks.some((task) => isShown(note, task, showing)))
}

export function countTasks(notes: NoteTasks[]) {
  const tasks = notes.flatMap((n) => n.lists.flatMap((l) => l.tasks))
  const done = tasks.filter((t) => t.checked).length
  return { open: tasks.length - done, done }
}
