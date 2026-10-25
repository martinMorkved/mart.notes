import { useSuspenseQuery } from '@tanstack/react-query'
import { foldersQuery } from '@/features/folders/queries'
import { PageHeader } from '@/ui/PageHeader'
import { ArchiveItem } from './ArchiveItem'
import { archivedFolders } from './archivedFolders'
import './archive.css'

export function ArchiveView() {
  const { data: folders } = useSuspenseQuery(foldersQuery)
  const rows = archivedFolders(folders)

  return (
    <section className="page">
      <PageHeader title="Archive">
        Folders kept out of the way. They are never deleted, and search still finds them.
      </PageHeader>

      {rows.length ? (
        <ul className="archive-list">
          {rows.map((row) => (
            <ArchiveItem key={row.folder.id} {...row} />
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <p>Nothing is archived. Archive a folder from its menu in the sidebar, or drag it onto Archive.</p>
        </div>
      )}
    </section>
  )
}
