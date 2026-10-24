import { plainExcerpt } from '@/lib/text'
import type { DragData } from './dragData'

// What follows the pointer. A card shrinks to a label over the sidebar, to show it's going
// into a folder rather than being placed among the cards.
export function DragPreview({ dragged, overFolder }: { dragged: DragData; overFolder: boolean }) {
  if (dragged.type === 'folder') return <div className="drag-folder">{dragged.folder.name}</div>

  const { note } = dragged
  return (
    <div className="card drag-card" data-over-folder={overFolder || undefined}>
      <h2 className="card-title" data-untitled={!note.title || undefined}>
        {note.title || 'Untitled'}
      </h2>
      <p className="card-excerpt">{plainExcerpt(note.excerpt) || 'Empty note'}</p>
    </div>
  )
}
