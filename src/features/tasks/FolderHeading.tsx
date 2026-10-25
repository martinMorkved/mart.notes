import { Link } from 'react-router'
import type { Folder } from '@shared/types'
import { ancestorsOf } from '@/features/folders/hierarchy'
import { useFolderClick } from '@/features/transitions/useFolderClick'

// Where the notes below it live, shown again each time the folder changes down the page
export function FolderHeading({ folder, folders }: { folder: Folder; folders: Folder[] }) {
  const folderClick = useFolderClick()
  const trail = ancestorsOf(folders, folder.id)

  return (
    <h2 className="task-folder-heading">
      {trail.length > 0 && <span className="task-trail">{trail.map((f) => f.name).join(' / ')} /</span>}
      <Link to={`/folder/${folder.id}`} onClick={folderClick(folder.id)}>
        <span data-folder-label>{folder.name}</span>
      </Link>
    </h2>
  )
}
