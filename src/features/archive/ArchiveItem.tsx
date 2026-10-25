import { Link } from 'react-router'
import { useDeleteFolder, useUnarchiveFolder } from '@/features/folders/mutations'
import { useFolderClick } from '@/features/transitions/useFolderClick'
import { shortDate } from '@/lib/text'
import type { ArchivedFolder } from './archivedFolders'

export function ArchiveItem({ folder, parentName }: ArchivedFolder) {
  const unarchive = useUnarchiveFolder()
  const deleteFolder = useDeleteFolder()
  const folderClick = useFolderClick()

  return (
    <li className="archive-row">
      <div>
        <Link className="archive-name" to={`/folder/${folder.id}`} onClick={folderClick(folder.id)}>
          <span data-folder-label>{folder.name}</span>
        </Link>
        <p className="archive-meta">
          {parentName ? `In ${parentName} · ` : ''}archived {shortDate(folder.archivedAt!)}
        </p>
      </div>
      <div className="archive-actions">
        <button className="button-quiet" onClick={() => unarchive.mutate(folder)}>
          Unarchive
        </button>
        <button className="button-quiet" data-danger onClick={() => deleteFolder.mutate(folder)}>
          Move to trash
        </button>
      </div>
    </li>
  )
}
