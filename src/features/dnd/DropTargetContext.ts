import { createContext, use } from 'react'
import type { DropZone } from './dragData'

// The folder row under a drag right now, and where on it, so the row can show the drop
export type DropTarget = { folderId: string; zone: DropZone } | null

export const DropTargetContext = createContext<DropTarget>(null)

export function useDropZone(folderId: string) {
  const target = use(DropTargetContext)
  return target?.folderId === folderId ? target.zone : undefined
}
