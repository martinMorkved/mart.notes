import type { Trash } from '@shared/types'

export type TrashRow = {
  kind: 'folders' | 'notes'
  id: string
  name: string
  from: string | null
  deletedAt: string
}

export function trashRows(trash: Trash): TrashRow[] {
  const folders = trash.folders.map((f) => ({
    kind: 'folders' as const,
    id: f.id,
    name: f.name,
    from: f.parentName,
    deletedAt: f.deletedAt,
  }))
  const notes = trash.notes.map((n) => ({
    kind: 'notes' as const,
    id: n.id,
    name: n.title || 'Untitled',
    from: n.folderName,
    deletedAt: n.deletedAt,
  }))
  return [...folders, ...notes].sort((a, b) => b.deletedAt.localeCompare(a.deletedAt))
}
