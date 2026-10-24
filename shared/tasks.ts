// Checkboxes are read straight from a note's markdown, so the to-do page always matches the
// notes. A task is known by its place among the note's tasks (index) and its line.

const TASK = /^(\s*)[-*+]\s+\[([ xX])\](?:\s+(.*))?$/
const HEADING = /^#{1,6}\s+(.*)$/
const FENCE = /^\s*(```|~~~)/

export type Task = {
  index: number
  line: number
  depth: number
  checked: boolean
  text: string
  // when it was ticked, added by the server where it's known
  doneAt?: string
}

// Tasks on lines right after each other make one list. Its name is the heading above it, if any.
export type TaskList = { heading: string | null; tasks: Task[] }

export function parseTasks(markdown: string) {
  const lists: TaskList[] = []
  let heading: string | null = null
  let inFence = false
  let current: TaskList | null = null
  let index = 0

  markdown.split('\n').forEach((text, line) => {
    if (FENCE.test(text)) inFence = !inFence
    const task = inFence ? null : TASK.exec(text)
    if (!task) {
      current = null
      const h = inFence ? null : HEADING.exec(text)
      if (h) heading = h[1].trim()
      return
    }
    if (!current) {
      current = { heading, tasks: [] }
      lists.push(current)
    }
    current.tasks.push({
      index: index++,
      line,
      depth: Math.floor(task[1].replace(/\t/g, '  ').length / 2),
      checked: task[2] !== ' ',
      text: task[3] ?? '',
    })
  })
  return lists
}

// The tasks nested under `task`: the ones right after it in its list that sit deeper
export function subtasksOf(tasks: Task[], task: Task) {
  const start = tasks.indexOf(task) + 1
  const end = tasks.findIndex((t, i) => i >= start && t.depth <= task.depth)
  return tasks.slice(start, end < 0 ? tasks.length : end)
}

// The markdown with one task ticked or unticked, or null when that task isn't there any more.
// Ticking a task ticks the ones nested under it too, like finishing a task with sub-tasks.
export function setTask(markdown: string, index: number, text: string, checked: boolean) {
  const list = parseTasks(markdown).find((l) => l.tasks.some((t) => t.index === index))
  const task = list?.tasks.find((t) => t.index === index)
  if (!list || !task || task.text !== text) return null

  const lines = markdown.split('\n')
  for (const t of checked ? [task, ...subtasksOf(list.tasks, task)] : [task]) {
    lines[t.line] = lines[t.line].replace(/\[[ xX]\]/, checked ? '[x]' : '[ ]')
  }
  return lines.join('\n')
}
