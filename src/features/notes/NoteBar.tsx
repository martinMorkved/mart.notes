import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeftIcon } from '@/ui/icons'

type Props = {
  folderId: string
  folderName: string
  children: ReactNode
}

export function NoteBar({ folderId, folderName, children }: Props) {
  return (
    <header className="note-bar">
      <Link className="note-back" to={`/folder/${folderId}`}>
        <ArrowLeftIcon />
        <span>{folderName}</span>
      </Link>
      <div className="note-tools">{children}</div>
    </header>
  )
}
