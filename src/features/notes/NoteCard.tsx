import { Link } from 'react-router'
import type { NoteSummary } from '@shared/types'
import { preload } from '@/features/transitions/preload'
import { tagNoteCard } from '@/features/transitions/tagNoteCard'
import { useTransitionClick } from '@/features/transitions/useTransitionClick'
import { plainExcerpt, shortDate } from '@/lib/text'

export function NoteCard({ note }: { note: NoteSummary }) {
  const click = useTransitionClick()
  const to = `/note/${note.id}`
  const excerpt = plainExcerpt(note.excerpt)

  return (
    <Link
      className="card"
      to={to}
      data-note-card={note.id}
      onPointerEnter={() => preload(to)}
      onFocus={() => preload(to)}
      onClick={click(to, () => ({ types: ['open-note'], before: () => tagNoteCard(note.id) }))}
    >
      <h2 className="card-title" data-untitled={!note.title || undefined}>
        <span data-note-card-title>{note.title || 'Untitled'}</span>
      </h2>
      <p className="card-excerpt">{excerpt || 'Empty note'}</p>
      <time className="card-date" dateTime={note.updatedAt}>
        {shortDate(note.updatedAt)}
      </time>
    </Link>
  )
}
