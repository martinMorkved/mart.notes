import { Link } from 'react-router'
import { shortDate } from '@/lib/text'
import { ArrowLeftIcon } from '@/ui/icons'
import { Menu } from '@/ui/Menu'

type Props = {
  folderId: string
  folderName: string
  updatedAt: string
  onDelete: () => void
}

export function NoteBar({ folderId, folderName, updatedAt, onDelete }: Props) {
  return (
    <header className="note-bar">
      <Link className="note-back" to={`/folder/${folderId}`}>
        <ArrowLeftIcon />
        {folderName}
      </Link>
      <time className="note-date" dateTime={updatedAt}>
        Edited {shortDate(updatedAt)}
      </time>
      <Menu label="Note actions" items={[{ label: 'Move to trash', onSelect: onDelete, danger: true }]} />
    </header>
  )
}
