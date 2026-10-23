import { useSuspenseQuery } from '@tanstack/react-query'
import { PageHeader } from '@/ui/PageHeader'
import { EmptyTrashButton } from './EmptyTrashButton'
import { trashQuery } from './queries'
import { TrashItem } from './TrashItem'
import { trashRows } from './trashRows'
import './trash.css'

export function TrashView() {
  const { data: trash } = useSuspenseQuery(trashQuery)
  const rows = trashRows(trash)

  return (
    <section className="page">
      <PageHeader title="Trash" action={rows.length > 0 && <EmptyTrashButton />}>
        Items in the trash can be restored. Deleting them here is permanent.
      </PageHeader>

      {rows.length ? (
        <ul className="trash-list">
          {rows.map((row) => (
            <TrashItem key={row.id} row={row} />
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <p>The trash is empty.</p>
        </div>
      )}
    </section>
  )
}
