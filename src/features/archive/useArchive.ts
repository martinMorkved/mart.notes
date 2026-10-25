import type { Folder } from '@shared/types'
import { useArchiveFolder } from '@/features/folders/mutations'
import { bumpArchiveLink, swooshToArchive } from './swooshToArchive'

// From the menu the folder swooshes down to the Archive link. Dropped on the link it's already
// there, so the icon only bumps.
export function useArchive() {
  const archiveFolder = useArchiveFolder()

  return {
    fromMenu: (folder: Folder) => swooshToArchive(folder.id, () => archiveFolder.mutate(folder)),
    fromDrop: (folder: Folder) => {
      archiveFolder.mutate(folder)
      bumpArchiveLink()
    },
  }
}
