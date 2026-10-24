import type { NoteTasks } from '@shared/types'

export const taskKey = (noteId: string, index: number) => `${noteId}:${index}`

// Done tasks are hidden, like in Todoist, unless they're asked for (showAll). One just ticked
// stays a moment longer, while it slides away.
export type Showing = { showAll: boolean; leaving: Set<string> }

// A note stays among the active ones while something in it is open, or still sliding away;
// one where everything's done moves to the completed notes at the bottom
export function isActive(note: NoteTasks, leaving: Set<string>) {
  return note.lists.some((list) =>
    list.tasks.some((task) => !task.checked || leaving.has(taskKey(note.noteId, task.index))),
  )
}

export function countTasks(notes: NoteTasks[]) {
  const tasks = notes.flatMap((n) => n.lists.flatMap((l) => l.tasks))
  const done = tasks.filter((t) => t.checked).length
  return { open: tasks.length - done, done }
}
