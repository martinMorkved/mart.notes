import { NavLink } from 'react-router'
import type { SearchResult } from '@shared/types'
import { linkedNote } from '@/features/transitions/linkedNote'
import { preload } from '@/features/transitions/preload'
import { useTransitionClick } from '@/features/transitions/useTransitionClick'
import { plainExcerpt } from '@/lib/text'
import { ArchivedMark } from './ArchivedMark'
import { Highlighted } from './Highlighted'

export function NoteHit({ note }: { note: SearchResult }) {
  const click = useTransitionClick()
  const to = `/note/${note.id}`
  const snippet = plainExcerpt(note.snippet)

  return (
    <li>
      <NavLink
        className="search-hit"
        to={to}
        onPointerEnter={() => preload(to)}
        onFocus={() => preload(to)}
        onClick={click(to, linkedNote)}
      >
        <span className="search-hit-title" data-untitled={!note.title || undefined}>
          {note.title ? <Highlighted text={note.title} /> : 'Untitled'}
        </span>
        <span className="search-hit-folder">
          {note.archived && <ArchivedMark />}
          {note.folderName}
        </span>
        {snippet && (
          <span className="search-hit-snippet">
            <Highlighted text={snippet} />
          </span>
        )}
      </NavLink>
    </li>
  )
}
