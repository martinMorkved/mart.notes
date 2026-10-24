import type { Active, DragMoveEvent, Over } from '@dnd-kit/core'
import type { Folder, NoteSummary } from '@shared/types'

// What's being dragged, or dropped on: a note card or a folder in the tree
export type DragData = { type: 'note'; note: NoteSummary } | { type: 'folder'; folder: Folder }

export const dataOf = (item: Active | Over | null | undefined) => item?.data.current as DragData | undefined

// A folder row is split in three: the top and bottom place the dragged folder next to it,
// the middle puts it inside
export type DropZone = 'before' | 'inside' | 'after'

function pointerY(event: Pick<DragMoveEvent, 'activatorEvent' | 'delta'>) {
  const start = event.activatorEvent
  const y = 'touches' in start ? (start as TouchEvent).touches[0]?.clientY : (start as PointerEvent).clientY
  return (y ?? 0) + event.delta.y
}

export function folderDropZone(event: Pick<DragMoveEvent, 'activatorEvent' | 'delta' | 'over'>): DropZone {
  const rect = event.over!.rect
  const y = (pointerY(event) - rect.top) / rect.height
  return y < 0.3 ? 'before' : y > 0.7 ? 'after' : 'inside'
}
