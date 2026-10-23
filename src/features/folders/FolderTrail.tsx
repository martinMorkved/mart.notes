import { Link } from 'react-router'
import type { Folder } from '@shared/types'

export function FolderTrail({ folders }: { folders: Folder[] }) {
  if (!folders.length) return null

  return (
    <nav className="trail" aria-label="Path">
      {folders.map((folder) => (
        <Link key={folder.id} to={`/folder/${folder.id}`}>
          {folder.name}
        </Link>
      ))}
    </nav>
  )
}
