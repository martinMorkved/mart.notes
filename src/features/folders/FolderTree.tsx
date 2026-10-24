import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { PlusIcon } from '@/ui/icons'
import { FolderPicker } from './FolderPicker'
import { FolderTreeContext } from './FolderTreeContext'
import { FolderTreeLevel } from './FolderTreeLevel'
import { foldersQuery } from './queries'
import { childrenByParent, subtreeIds } from './tree'
import { useExpandedFolders } from './useExpandedFolders'
import { useFolderActions } from './useFolderActions'
import { useTreeDrops } from './useTreeDrops'
import './folders.css'

export function FolderTree({ activeFolderId }: { activeFolderId: string | null }) {
  const { data: folders } = useSuspenseQuery(foldersQuery)
  const children = useMemo(() => childrenByParent(folders), [folders])
  const { expanded, toggle } = useExpandedFolders(folders, activeFolderId)
  const actions = useFolderActions({
    folders,
    activeFolderId,
    onExpand: (id) => toggle(id, true),
  })
  useTreeDrops(folders, (id) => toggle(id, true))

  return (
    <FolderTreeContext value={{ children, expanded, toggle, activeFolderId, actions }}>
      <div className="sidebar-section">
        <div className="sidebar-heading">
          <h2>Folders</h2>
          <button className="icon-button" aria-label="New folder" onClick={() => actions.create(null)}>
            <PlusIcon />
          </button>
        </div>
        <div className="tree">
          {children.get(null)?.length ? (
            <FolderTreeLevel parentId={null} depth={0} />
          ) : (
            <p className="sidebar-empty">No folders yet.</p>
          )}
        </div>
      </div>
      {actions.moving && (
        <FolderPicker
          title={`Move “${actions.moving.name}” to…`}
          currentId={actions.moving.parentId}
          hidden={subtreeIds(folders, actions.moving.id)}
          allowTopLevel
          onPick={(target) => actions.moveInto(actions.moving!, target)}
          onClose={() => actions.startMove(null)}
        />
      )}
    </FolderTreeContext>
  )
}
