import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { linkedNote } from '@/features/transitions/linkedNote'
import { preload } from '@/features/transitions/preload'
import { useTransitionClick } from '@/features/transitions/useTransitionClick'
import { backlinksQuery } from './queries'
import './links.css'

// The notes whose [[links]] point here
export function Backlinks({ noteId }: { noteId: string }) {
  const { data: backlinks } = useQuery(backlinksQuery(noteId))
  const click = useTransitionClick()

  if (!backlinks?.length) return null

  return (
    <section className="backlinks" aria-labelledby="backlinks-heading">
      <h2 id="backlinks-heading">Linked from</h2>
      <ul>
        {backlinks.map((link) => {
          const to = `/note/${link.id}`
          return (
            <li key={link.id}>
              <Link
                to={to}
                onPointerEnter={() => preload(to)}
                onFocus={() => preload(to)}
                onClick={click(to, linkedNote)}
              >
                <span className="backlinks-title">{link.title || 'Untitled'}</span>
                <span className="backlinks-folder">{link.folderName}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
