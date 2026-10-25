import { Link } from 'react-router'
import type { Folder } from '@shared/types'
import { useFolderClick } from '@/features/transitions/useFolderClick'
import './trail.css'

export function FolderTrail({ folders }: { folders: Folder[] }) {
  const folderClick = useFolderClick()
  if (!folders.length) return null

  return (
    <nav className="trail" aria-label="Path">
      {folders.map((folder) => (
        <Link key={folder.id} to={`/folder/${folder.id}`} onClick={folderClick(folder.id)}>
          <span data-folder-label>{folder.name}</span>
        </Link>
      ))}
    </nav>
  )
}
