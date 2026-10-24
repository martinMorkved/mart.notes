import { useDndMonitor } from '@dnd-kit/core'
import type { Folder } from '@shared/types'
import { dataOf } from '@/features/dnd/dragData'
import { dropTargetOf } from '@/features/dnd/dropTarget'
import { useMoveNote } from '@/features/notes/mutations'
import { useMoveFolder } from './mutations'
import { placeFolder } from './tree'

// Drops on the folder tree: a note goes into the folder, a folder next to it or inside it
export function useTreeDrops(folders: Folder[], onExpand: (id: string) => void) {
  const moveNote = useMoveNote()
  const moveFolder = useMoveFolder()

  useDndMonitor({
    onDragEnd(event) {
      const target = dropTargetOf(event)
      const dragged = dataOf(event.active)
      const folder = folders.find((f) => f.id === target?.folderId)
      if (!target || !dragged || !folder) return

      if (dragged.type === 'note') {
        moveNote({ note: dragged.note, folderId: folder.id, folderName: folder.name })
        return
      }
      moveFolder.mutate({ id: dragged.folder.id, ...placeFolder(folders, dragged.folder, folder, target.zone) })
      if (target.zone === 'inside') onExpand(folder.id)
    },
  })
}
