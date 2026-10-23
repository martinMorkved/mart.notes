import { Link } from 'react-router'
import type { NoteSummary } from '@shared/types'
import { plainExcerpt, shortDate } from '@/lib/text'

export function NoteCard({ note }: { note: NoteSummary }) {
  const excerpt = plainExcerpt(note.excerpt)
  return (
    <Link className="card" to={`/note/${note.id}`}>
      <h2 className="card-title" data-untitled={!note.title || undefined}>
        {note.title || 'Untitled'}
      </h2>
      <p className="card-excerpt">{excerpt || 'Empty note'}</p>
      <time className="card-date" dateTime={note.updatedAt}>
        {shortDate(note.updatedAt)}
      </time>
    </Link>
  )
}
