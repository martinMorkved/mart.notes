import { NavLink } from 'react-router'
import type { Folder } from '@shared/types'
import { useFolderClick } from '@/features/transitions/useFolderClick'
import { ArchivedMark } from './ArchivedMark'

type Props = { folder: Folder; parentName: string | null }

export function FolderHit({ folder, parentName }: Props) {
  const folderClick = useFolderClick()

  return (
    <li>
      <NavLink className="search-hit" to={`/folder/${folder.id}`} onClick={folderClick(folder.id)}>
        <span className="search-hit-title">
          <span className="tree-label" data-folder-label>
            {folder.name}
          </span>
        </span>
        {(parentName || folder.archivedAt) && (
          <span className="search-hit-folder">
            {folder.archivedAt && <ArchivedMark />}
            {parentName}
          </span>
        )}
      </NavLink>
    </li>
  )
}
