import { useDndMonitor, useDroppable } from '@dnd-kit/core'
import { NavLink } from 'react-router'
import { type DropData, dataOf, dropDataOf } from '@/features/dnd/dragData'
import { ArchiveIcon } from '@/ui/icons'
import { useArchive } from './useArchive'
import './archive.css'

const data: DropData = { type: 'archive' }

// The Archive page in the sidebar, and a place to drop a folder to archive it
export function ArchiveLink() {
  const archive = useArchive()
  const { setNodeRef, isOver, active } = useDroppable({ id: 'archive', data })
  const takesDrop = isOver && dataOf(active)?.type === 'folder'

  useDndMonitor({
    onDragEnd({ active, over }) {
      const dragged = dataOf(active)
      if (dragged?.type === 'folder' && dropDataOf(over)?.type === 'archive') archive.fromDrop(dragged.folder)
    },
  })

  return (
    <NavLink
      ref={setNodeRef}
      to="/archive"
      className="sidebar-link"
      data-archive-link
      data-drop={takesDrop || undefined}
    >
      <span className="archive-target" data-archive-target />
      <ArchiveIcon />
      Archive
    </NavLink>
  )
}
