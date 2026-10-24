import type { Task } from '@shared/tasks'

export type TaskNode = { task: Task; children: TaskNode[] }

// A flat list with depths into a tree: each task's parent is the nearest one above it that
// sits less deep
export function taskTree(tasks: Task[]) {
  const roots: TaskNode[] = []
  const stack: TaskNode[] = []
  for (const task of tasks) {
    const node: TaskNode = { task, children: [] }
    while (stack.length && stack.at(-1)!.task.depth >= task.depth) stack.pop()
    ;(stack.at(-1)?.children ?? roots).push(node)
    stack.push(node)
  }
  return roots
}

// A row to draw: the task at the depth it's shown at, and for a done sub-task shown on its
// own, the task it belongs under
export type TaskLine = { task: Task; parent?: Task }

// Splits a list into what's left to do and what's done. A task counts as done once it and
// everything under it is ticked; until then it stays in place with its open sub-tasks. Done
// branches keep their sub-tasks, latest first.
export function splitTasks(tasks: Task[], isDone: (task: Task) => boolean) {
  const done: { root: TaskNode; parent?: Task }[] = []
  const finished = (node: TaskNode): boolean => isDone(node.task) && node.children.every(finished)

  const prune = (nodes: TaskNode[], parent?: Task): TaskNode[] =>
    nodes.flatMap((node) => {
      if (finished(node)) {
        done.push({ root: node, parent })
        return []
      }
      return [{ ...node, children: prune(node.children, node.task) }]
    })
  const open = prune(taskTree(tasks))

  done.sort((a, b) => (b.root.task.doneAt ?? '').localeCompare(a.root.task.doneAt ?? ''))
  return {
    open: lines(open),
    done: done.flatMap(({ root, parent }) => lines([root]).map((line, i) => (i === 0 ? { ...line, parent } : line))),
  }
}

// The tree back to rows, with depths counted from where it's drawn
function lines(nodes: TaskNode[], depth = 0): TaskLine[] {
  return nodes.flatMap((node) => [{ task: { ...node.task, depth } }, ...lines(node.children, depth + 1)])
}
