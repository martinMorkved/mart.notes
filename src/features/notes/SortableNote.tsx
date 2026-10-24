import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { NoteSummary } from '@shared/types'
import type { DragData } from '@/features/dnd/dragData'
import { NoteCard } from './NoteCard'

// A card that can be dragged to a new spot in the folder, or onto a folder in the sidebar
export function SortableNote({ note }: { note: NoteSummary }) {
  const data: DragData = { type: 'note', note }
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: note.id, data })

  return (
    <li
      ref={setNodeRef}
      className="sortable-note"
      data-dragging={isDragging || undefined}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      // The card link stays the thing you tab to, so the item itself is left out of the order
      tabIndex={-1}
      {...listeners}
    >
      <NoteCard note={note} />
    </li>
  )
}
