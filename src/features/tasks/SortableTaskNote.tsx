import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ReactNode } from 'react'

// A place in the priority order that can be dragged to another. It carries the folder heading
// above the card along, since the heading belongs to where the card is now.
export function SortableTaskNote({ noteId, children }: { noteId: string; children: ReactNode }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: noteId })

  return (
    <li
      ref={setNodeRef}
      className="task-item"
      data-sortable
      data-dragging={isDragging || undefined}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      // The links and checkboxes inside are what you tab to, not the item
      tabIndex={-1}
      {...listeners}
    >
      {children}
    </li>
  )
}
