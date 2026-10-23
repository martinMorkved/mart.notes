import { shortDate } from '@/lib/text'
import { showToast } from '@/ui/toast'
import { usePurge, useRestore } from './mutations'
import type { TrashRow } from './trashRows'

export function TrashItem({ row }: { row: TrashRow }) {
  const restore = useRestore()
  const purge = usePurge()

  function onRestore() {
    restore.mutate(row, {
      onSuccess: (counts) => {
        const extraFolders = row.kind === 'notes' ? counts.folders : counts.folders - 1
        showToast({
          message:
            extraFolders > 0
              ? `Restored “${row.name}” and the folders around it`
              : `Restored “${row.name}”`,
        })
      },
    })
  }

  return (
    <li className="trash-row">
      <div>
        <p className="trash-name">
          <span className="trash-kind">{row.kind === 'folders' ? 'Folder' : 'Note'}</span>
          {row.name}
        </p>
        <p className="trash-meta">
          {row.from ? `From ${row.from} · ` : ''}deleted {shortDate(row.deletedAt)}
        </p>
      </div>
      <div className="trash-actions">
        <button className="button-quiet" onClick={onRestore}>
          Restore
        </button>
        <button className="button-quiet" data-danger onClick={() => purge.mutate(row)}>
          Delete forever
        </button>
      </div>
    </li>
  )
}
