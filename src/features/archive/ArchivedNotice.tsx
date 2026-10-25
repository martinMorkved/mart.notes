import { useSuspenseQuery } from '@tanstack/react-query'
import { foldersQuery } from '@/features/folders/queries'
import { useUnarchiveFolder } from '@/features/folders/mutations'
import { shortDate } from '@/lib/text'
import { ArchiveIcon } from '@/ui/icons'
import { archiveRoot } from './archivedFolders'
import './archive.css'

// Above an archived folder's notes, with the way back into the tree
export function ArchivedNotice({ folderId }: { folderId: string }) {
  const { data: folders } = useSuspenseQuery(foldersQuery)
  const unarchive = useUnarchiveFolder()
  const root = archiveRoot(folders, folderId)
  if (!root) return null

  return (
    <p className="archived-notice">
      <ArchiveIcon />
      <span>
        {root.id === folderId ? 'Archived' : `Inside “${root.name}”, archived`} {shortDate(root.archivedAt!)}
      </span>
      <button className="button-quiet" onClick={() => unarchive.mutate(root)}>
        {root.id === folderId ? 'Unarchive' : `Unarchive “${root.name}”`}
      </button>
    </p>
  )
}
