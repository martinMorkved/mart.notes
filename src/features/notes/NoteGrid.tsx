import { useDndMonitor } from '@dnd-kit/core'
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { useState } from 'react'
import type { NoteSummary } from '@shared/types'
import { dataOf } from '@/features/dnd/dragData'
import { positionBetween } from '@/lib/positions'
import { useMoveNote } from './mutations'
import { SortableNote } from './SortableNote'
import './notes.css'

export function NoteGrid({ notes, onNewNote }: { notes: NoteSummary[]; onNewNote: () => void }) {
  const moveNote = useMoveNote()

  // The order shown. It must change in the same render as the drop: the query cache passes
  // its update on a tick later, and in between the cards would slide back and jump again.
  const [order, setOrder] = useState(notes)
  const [prevNotes, setPrevNotes] = useState(notes)
  if (notes !== prevNotes) {
    setPrevNotes(notes)
    setOrder(notes)
  }

  // A card dropped on another card takes its spot, between that card's neighbours
  useDndMonitor({
    onDragEnd({ active, over }) {
      const dragged = dataOf(active)
      if (dragged?.type !== 'note' || dataOf(over)?.type !== 'note' || active.id === over!.id) return
      const from = order.findIndex((n) => n.id === active.id)
      const to = order.findIndex((n) => n.id === over!.id)
      if (from < 0 || to < 0) return
      const moved = arrayMove(order, from, to)
      const position = positionBetween(moved[to - 1], moved[to + 1])
      setOrder(moved.map((n) => (n.id === active.id ? { ...n, position } : n)))
      moveNote({ note: dragged.note, folderId: dragged.note.folderId, position })
    },
  })

  if (!order.length) {
    return (
      <div className="empty-state">
        <p>This folder is empty.</p>
        <button className="button-quiet" onClick={onNewNote}>
          Write the first note
        </button>
      </div>
    )
  }

  return (
    <SortableContext items={order.map((n) => n.id)} strategy={rectSortingStrategy}>
      <ul className="cards">
        {order.map((note) => (
          <SortableNote key={note.id} note={note} />
        ))}
      </ul>
    </SortableContext>
  )
}
