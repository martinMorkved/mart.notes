import { arrayMove } from '@dnd-kit/sortable'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import type { NoteTasks } from '@shared/types'
import { positionBetween } from '@/lib/positions'
import { useMoveTaskNote } from './mutations'
import { swapCards } from './swapCards'

const keyOf = (note?: NoteTasks) => (note ? { position: note.todoPosition } : undefined)
const card = (note: NoteTasks) => document.querySelector(`[data-task-note="${note.noteId}"]`)

// The order of the notes on the to-do page, and moving one to a new place in it. The order is
// kept here as well as in the query cache, which passes changes on a tick later: a dropped card
// would otherwise jump back for a moment before landing.
export function useTodoOrder(notes: NoteTasks[]) {
  const moveNote = useMoveTaskNote()
  const [items, setItems] = useState(notes)
  const [prevNotes, setPrevNotes] = useState(notes)
  if (notes !== prevNotes) {
    setPrevNotes(notes)
    setItems(notes)
  }

  function place(from: number, to: number) {
    const moved = arrayMove(items, from, to)
    const todoPosition = positionBetween(keyOf(moved[to - 1]), keyOf(moved[to + 1]))
    const noteId = items[from].noteId
    setItems(moved.map((n) => (n.noteId === noteId ? { ...n, todoPosition } : n)))
    moveNote.mutate({ noteId, todoPosition })
  }

  // From the arrow buttons: the card swaps places with its neighbour
  function step(note: NoteTasks, by: -1 | 1) {
    const from = items.indexOf(note)
    const neighbour = items[from + by]
    if (!neighbour) return
    swapCards(card(note), card(neighbour), () => flushSync(() => place(from, from + by)))
  }

  // From a drag: dropped on the spot of another card
  function drop(noteId: string, overId: string) {
    const from = items.findIndex((n) => n.noteId === noteId)
    const to = items.findIndex((n) => n.noteId === overId)
    if (from >= 0 && to >= 0 && from !== to) place(from, to)
  }

  return { items, step, drop }
}
