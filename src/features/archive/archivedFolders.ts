import type { Folder } from '@shared/types'

export type ArchivedFolder = { folder: Folder; parentName: string | null }

// The folders that were archived themselves, not the ones that went along inside them
export function archivedFolders(folders: Folder[]): ArchivedFolder[] {
  const byId = new Map(folders.map((f) => [f.id, f]))
  return folders
    .filter((f) => f.archivedAt && !(f.parentId && byId.get(f.parentId)?.archivedAt))
    .map((folder) => ({ folder, parentName: folder.parentId ? (byId.get(folder.parentId)?.name ?? null) : null }))
    .sort((a, b) => b.folder.archivedAt!.localeCompare(a.folder.archivedAt!))
}

// The archived folder this one sits in, or itself, the one an unarchive brings back
export function archiveRoot(folders: Folder[], id: string) {
  const byId = new Map(folders.map((f) => [f.id, f]))
  let folder = byId.get(id)
  if (!folder?.archivedAt) return null
  while (folder.parentId && byId.get(folder.parentId)?.archivedAt) folder = byId.get(folder.parentId)!
  return folder
}
