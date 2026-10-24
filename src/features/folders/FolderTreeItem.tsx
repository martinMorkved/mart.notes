import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { CSSProperties, ReactNode } from 'react'
import { NavLink } from 'react-router'
import type { Folder } from '@shared/types'
import type { DragData } from '@/features/dnd/dragData'
import { useDropZone } from '@/features/dnd/DropTargetContext'
import { useFolderClick } from '@/features/transitions/useFolderClick'
import { ChevronIcon } from '@/ui/icons'
import { Menu } from '@/ui/Menu'
import { useFolderTree } from './FolderTreeContext'
import { RenameInput } from './RenameInput'

type Props = { folder: Folder; depth: number; children: ReactNode }

export function FolderTreeItem({ folder, depth, children }: Props) {
  const { children: childMap, expanded, toggle, activeFolderId, actions } = useFolderTree()
  const hasChildren = Boolean(childMap.get(folder.id)?.length)
  const isOpen = expanded.has(folder.id)
  const folderClick = useFolderClick()

  // The row is both dragged and dropped on: next to it to reorder, onto it to nest
  const dragId = `folder:${folder.id}`
  const data: DragData = { type: 'folder', folder }
  const editing = actions.editingId === folder.id
  const drag = useDraggable({ id: dragId, data, disabled: editing })
  const drop = useDroppable({ id: dragId, data })
  const zone = useDropZone(folder.id)

  return (
    <li
      role="treeitem"
      aria-expanded={hasChildren ? isOpen : undefined}
      aria-selected={folder.id === activeFolderId}
    >
      <div
        ref={(node) => {
          drag.setNodeRef(node)
          drop.setNodeRef(node)
        }}
        className="tree-row"
        style={{ '--depth': depth } as CSSProperties}
        data-drop={zone}
        data-dragging={drag.isDragging || undefined}
        {...drag.listeners}
      >
        <button
          className="tree-toggle"
          aria-label={isOpen ? `Collapse ${folder.name}` : `Expand ${folder.name}`}
          data-hidden={!hasChildren || undefined}
          tabIndex={hasChildren ? 0 : -1}
          onClick={() => toggle(folder.id)}
        >
          <ChevronIcon data-open={isOpen || undefined} />
        </button>

        {editing ? (
          <RenameInput initial={folder.name} onDone={(name) => actions.finishRename(folder, name)} />
        ) : (
          <NavLink className="tree-link" to={`/folder/${folder.id}`} onClick={folderClick(folder.id)}>
            <span className="tree-label" data-folder-label>
              {folder.name}
            </span>
          </NavLink>
        )}

        <Menu
          className="tree-menu"
          label={`Actions for ${folder.name}`}
          items={[
            { label: 'New folder inside', onSelect: () => actions.create(folder.id) },
            { label: 'Rename', onSelect: () => actions.startRename(folder.id) },
            { label: 'Move to…', onSelect: () => actions.startMove(folder) },
            { label: 'Move to trash', onSelect: () => actions.remove(folder), danger: true },
          ]}
        />
      </div>
      {children}
    </li>
  )
}
