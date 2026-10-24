import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { tagNoteCard } from '@/features/transitions/tagNoteCard'
import { useTransitionClick } from '@/features/transitions/useTransitionClick'
import { ArrowLeftIcon } from '@/ui/icons'

type Props = {
  noteId: string
  folderId: string
  folderName: string
  children: ReactNode
}

export function NoteBar({ noteId, folderId, folderName, children }: Props) {
  const click = useTransitionClick()
  const to = `/folder/${folderId}`

  return (
    <header className="note-bar">
      <Link
        className="note-back"
        to={to}
        onClick={click(to, () => ({ types: ['close-note'], after: () => tagNoteCard(noteId) }))}
      >
        <ArrowLeftIcon />
        <span>{folderName}</span>
      </Link>
      <div className="note-tools">{children}</div>
    </header>
  )
}
