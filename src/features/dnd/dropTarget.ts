import type { DragEndEvent, DragMoveEvent } from '@dnd-kit/core'
import { subtreeIds } from '@/features/folders/hierarchy'
import { foldersQuery } from '@/features/folders/queries'
import { queryClient } from '@/lib/queryClient'
import { dataOf, folderDropZone } from './dragData'
import type { DropTarget } from './DropTargetContext'

// Where a drag over a folder row would land, or null where it can't go
export function dropTargetOf(event: DragMoveEvent | DragEndEvent): DropTarget {
  const dragged = dataOf(event.active)
  const over = dataOf(event.over)
  if (!dragged || over?.type !== 'folder') return null
  if (dragged.type === 'note') {
    return dragged.note.folderId === over.folder.id ? null : { folderId: over.folder.id, zone: 'inside' }
  }
  const folders = queryClient.getQueryData(foldersQuery.queryKey) ?? []
  if (subtreeIds(folders, dragged.folder.id).has(over.folder.id)) return null
  return { folderId: over.folder.id, zone: folderDropZone(event) }
}
